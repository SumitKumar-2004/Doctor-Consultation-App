const express = require("express");
const Appointment = require("../modal/Appointment");
const Doctor = require("../modal/Doctor");
const Patient = require("../modal/Patient");
const { authenticate, requireRole } = require("../middleware/auth");
const { body, query } = require("express-validator");
const validate = require("../middleware/validate");

const router = express.Router();

// Get patient appointments with filters
router.get(
  "/patient",
  authenticate,
  requireRole("patient"),
  [
    query("status")
      .optional()
      .isArray()
      .bail()
      .custom((val) => {
        if (Array.isArray(val)) {
          return val.every((v) =>
            ["Scheduled", "Completed", "Cancelled", "In Progress"].includes(v),
          );
        }
        return ["Scheduled", "Completed", "Cancelled", "In Progress"].includes(
          val,
        );
      }),
    query("from").optional().isISO8601(),
    query("to").optional().isISO8601(),
    query("sortBy").optional().isIn(["date", "createdAt", "status"]),
    query("sortOrder").optional().isIn(["asc", "desc"]),
  ],
  validate,
  async (req, res) => {
    try {
      const {
        status,
        from,
        to,
        sortBy = "date",
        sortOrder = "asc",
      } = req.query;
      const filter = { patientId: req.user._id };

      // Handle status filter - support multiple statuses
      if (status) {
        const statuses = Array.isArray(status) ? status : [status];
        filter.status = { $in: statuses };
      }

      // Handle date range
      if (from || to) {
        filter.date = {};
        if (from) filter.date.$gte = new Date(from);
        if (to) filter.date.$lte = new Date(to);
      }

      const sortObj = {};
      sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

      const appointments = await Appointment.find(filter)
        .populate(
          "doctorId",
          "name specialization profileImage fees hospitalInfo",
        )
        .sort(sortObj)
        .lean();

      res.ok(appointments, "Appointments fetched");
    } catch (error) {
      res.error(error.message, 500);
    }
  },
);

// Get doctor appointments with filters
router.get(
  "/doctor",
  authenticate,
  requireRole("doctor"),
  [
    query("status")
      .optional()
      .isArray()
      .bail()
      .custom((val) => {
        if (Array.isArray(val)) {
          return val.every((v) =>
            ["Scheduled", "Completed", "Cancelled", "In Progress"].includes(v),
          );
        }
        return ["Scheduled", "Completed", "Cancelled", "In Progress"].includes(
          val,
        );
      }),
    query("from").optional().isISO8601(),
    query("to").optional().isISO8601(),
    query("sortBy").optional().isIn(["date", "createdAt", "status"]),
    query("sortOrder").optional().isIn(["asc", "desc"]),
  ],
  validate,
  async (req, res) => {
    try {
      const {
        status,
        from,
        to,
        sortBy = "date",
        sortOrder = "asc",
      } = req.query;
      const filter = { doctorId: req.user._id };

      // Handle status filter - support multiple statuses
      if (status) {
        const statuses = Array.isArray(status) ? status : [status];
        filter.status = { $in: statuses };
      }

      // Handle date range
      if (from || to) {
        filter.date = {};
        if (from) filter.date.$gte = new Date(from);
        if (to) filter.date.$lte = new Date(to);
      }

      const sortObj = {};
      sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

      const appointments = await Appointment.find(filter)
        .populate("patientId", "name phone medicalHistory age")
        .sort(sortObj)
        .lean();

      res.ok(appointments, "Appointments fetched");
    } catch (error) {
      res.error(error.message, 500);
    }
  },
);

// Get single appointment by ID
router.get("/:id", authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate(
        "doctorId",
        "name specialization profileImage fees hospitalInfo",
      )
      .populate("patientId", "name phone medicalHistory age");

    if (!appointment) {
      return res.error("Appointment not found", 404);
    }

    // Check authorization
    if (
      appointment.doctorId._id.toString() !== req.user._id.toString() &&
      appointment.patientId._id.toString() !== req.user._id.toString()
    ) {
      return res.error("Unauthorized", 403);
    }

    res.ok({ appointment }, "Appointment fetched");
  } catch (error) {
    res.error(error.message, 500);
  }
});

// Get booked slots for a doctor on a specific date
router.get("/booked-slots/:doctorId/:date", authenticate, async (req, res) => {
  try {
    const { doctorId, date } = req.params;

    // Parse the date - expecting format like 2024-02-20
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const bookedAppointments = await Appointment.find({
      doctorId: doctorId,
      date: {
        $gte: startDate,
        $lt: endDate,
      },
      status: { $ne: "Cancelled" },
    })
      .select("slotStartIso slotEndIso")
      .lean();

    const bookedSlots = bookedAppointments.map((apt) => ({
      start: apt.slotStartIso,
      end: apt.slotEndIso,
    }));

    res.ok(bookedSlots, "Booked slots fetched");
  } catch (error) {
    res.error(error.message, 500);
  }
});

// Book an appointment
router.post(
  "/book",
  authenticate,
  requireRole("patient"),
  [
    body("doctorId").notEmpty().isMongoId(),
    body("date")
      .notEmpty()
      .isString()
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage("Invalid date format"),
    body("slotStartIso").notEmpty().isString(),
    body("slotEndIso").notEmpty().isString(),
    body("consultationType")
      .optional()
      .isIn(["Video Consultation", "Voice Call"]),
    body("symptoms").optional().isString(),
    body("consultationFees").notEmpty().isNumeric(),
    body("platformFees").notEmpty().isNumeric(),
    body("totalAmount").notEmpty().isNumeric(),
  ],
  validate,
  async (req, res) => {
    try {
      console.log("📝 Booking request received:", {
        body: req.body,
        userId: req.user?._id,
      });

      const {
        doctorId,
        date,
        slotStartIso,
        slotEndIso,
        consultationType,
        symptoms,
        consultationFees,
        platformFees,
        totalAmount,
      } = req.body;

      // Check if doctor exists
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        console.warn("⚠️ Doctor not found:", doctorId);
        return res.error("Doctor not found", 404);
      }

      console.log("✅ Doctor found:", doctor.name);

      // Check for slot conflict
      const existingAppointment = await Appointment.findOne({
        doctorId,
        date: new Date(date),
        slotStartIso,
        slotEndIso,
        status: { $ne: "Cancelled" },
      });

      if (existingAppointment) {
        console.warn("⚠️ Slot already booked");
        return res.error("Slot is already booked", 409);
      }

      // Create appointment with unique Zego room ID
      const zegoRoomId = `appointment_${doctorId}_${req.user._id}_${Date.now()}`;

      const appointment = new Appointment({
        doctorId,
        patientId: req.user._id,
        date: new Date(date),
        slotStartIso,
        slotEndIso,
        consultationType: consultationType || "Video Consultation",
        symptoms: symptoms || "",
        consultationFees,
        platformFees,
        totalAmount,
        paymentStatus: "Pending",
        status: "Scheduled",
        zegoRoomId: zegoRoomId,
      });

      await appointment.save();
      console.log(
        "✅ Appointment saved:",
        appointment._id,
        "with zegoRoomId:",
        zegoRoomId,
      );

      await appointment.populate(
        "doctorId",
        "name specialization profileImage fees hospitalInfo",
      );
      console.log("✅ Appointment populated");

      res.created(appointment, "Appointment booked successfully");
    } catch (error) {
      console.error("❌ Booking error:", error);
      res.serverError("Failed to book appointment", [error.message]);
    }
  },
);

// Get join details for appointment call
router.get("/join/:id", authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("doctorId", "name")
      .populate("patientId", "name age");

    if (!appointment) {
      return res.error("Appointment not found", 404);
    }

    // Check authorization
    if (
      appointment.doctorId._id.toString() !== req.user._id.toString() &&
      appointment.patientId._id.toString() !== req.user._id.toString()
    ) {
      return res.error("Unauthorized", 403);
    }

    // Update status to In Progress
    appointment.status = "In Progress";
    await appointment.save();

    res.ok(
      {
        appointmentId: appointment._id,
        zegoRoomId: appointment.zegoRoomId,
        consultationType: appointment.consultationType,
        doctor: {
          id: appointment.doctorId._id,
          name: appointment.doctorId.name,
        },
        patient: {
          id: appointment.patientId._id,
          name: appointment.patientId.name,
        },
      },
      "Join details fetched",
    );
  } catch (error) {
    res.error(error.message, 500);
  }
});

// End consultation (for doctor)
router.put(
  "/end/:id",
  authenticate,
  requireRole("doctor"),
  [
    body("prescription").optional().isString(),
    body("notes").optional().isString(),
  ],
  validate,
  async (req, res) => {
    try {
      const { prescription, notes } = req.body;
      const appointment = await Appointment.findById(req.params.id);

      if (!appointment) {
        return res.error("Appointment not found", 404);
      }

      // Check authorization
      if (appointment.doctorId.toString() !== req.user._id.toString()) {
        return res.error("Unauthorized", 403);
      }

      appointment.status = "Completed";
      if (prescription) appointment.prescription = prescription;
      if (notes) appointment.notes = notes;

      await appointment.save();

      res.ok(appointment, "Appointment ended successfully");
    } catch (error) {
      res.error(error.message, 500);
    }
  },
);

// Update appointment status
router.put(
  "/status/:id",
  authenticate,
  [
    body("status")
      .notEmpty()
      .isIn(["Scheduled", "Completed", "Cancelled", "In Progress"]),
  ],
  validate,
  async (req, res) => {
    try {
      const { status } = req.body;
      const appointment = await Appointment.findById(req.params.id);

      if (!appointment) {
        return res.error("Appointment not found", 404);
      }

      // Check authorization - both doctor and patient can cancel, only doctor can complete
      const isDoctor =
        appointment.doctorId.toString() === req.user._id.toString();
      const isPatient =
        appointment.patientId.toString() === req.user._id.toString();

      if (!isDoctor && !isPatient) {
        return res.error("Unauthorized", 403);
      }

      // Only allow cancellation for both, completion only by doctor
      if (status === "Completed" && !isDoctor) {
        return res.error("Only doctor can mark appointment as completed", 403);
      }

      const oldStatus = appointment.status;
      appointment.status = status;
      await appointment.save();

      res.ok(appointment, "Appointment status updated");
    } catch (error) {
      res.error(error.message, 500);
    }
  },
);

module.exports = router;
