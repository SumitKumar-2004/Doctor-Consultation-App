const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { authenticate, requireRole } = require("../middleware/auth");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const Appointment = require("../modal/Appointment");

const router = express.Router();

router.post(
  "/create-payment-intent",
  authenticate,
  requireRole("patient"),
  [
    body("appointmentId")
      .isMongoId()
      .withMessage("valid appoitment ID is required"),
  ],
  validate,
  async (req, res) => {
    try {
      const { appointmentId } = req.body;

      // Find appointment
      const appointment = await Appointment.findById(appointmentId)
        .populate("doctorId", "name specialization")
        .populate("patientId", "name email phone");

      if (!appointment) {
        return res.notFound("Appointemnt not found");
      }

      if (appointment.patientId._id.toString() !== req.user._id.toString()) {
        return res.error("Unauthorized", 403);
      }

      if (appointment.paymentStatus === "Paid") {
        return res.ok(appointment, "Payment already completed");
      }

      const amount = Math.round(appointment.totalAmount * 100); // Convert to cents

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "inr",
        metadata: {
          appointmentId: appointmentId,
          doctorName: appointment.doctorId.name,
          patientName: appointment.patientId.name,
          consultationType: appointment.consultationType,
          date: appointment.date,
          slotStart: appointment.slotStartIso,
          slotEnd: appointment.slotEndIso,
        },
        description: `Consultation with Dr. ${appointment.doctorId.name}`,
      });

      res.ok(
        {
          clientSecret: paymentIntent.client_secret,
          amount: appointment.totalAmount,
          currency: "INR",
        },
        "Payment intent created successfully",
      );
    } catch (error) {
      res.serverError("Failed to create payment intent", [error.message]);
    }
  },
);

router.post(
  "/confirm-payment",
  authenticate,
  requireRole("patient"),
  [
    body("appointmentId")
      .isMongoId()
      .withMessage("valid appoitment ID is required"),
    body("paymentIntentId")
      .isString()
      .withMessage("Payment intent Id required"),
  ],
  validate,
  async (req, res) => {
    try {
      const { appointmentId, paymentIntentId } = req.body;

      // Find appointment
      const appointment = await Appointment.findById(appointmentId)
        .populate("doctorId", "name specialization")
        .populate("patientId", "name email phone");

      if (!appointment) {
        return res.notFound("Appointemnt not found");
      }

      if (appointment.patientId._id.toString() !== req.user._id.toString()) {
        return res.error("Unauthorized", 403);
      }

      // Retrieve payment intent from Stripe
      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== "succeeded") {
        return res.badRequest("Payment not completed");
      }

      if (paymentIntent.metadata.appointmentId !== appointmentId) {
        return res.badRequest("Payment intent does not match appointment");
      }

      // Update appointment with payment details
      appointment.paymentStatus = "Paid";
      appointment.paymentMethod = "Stripe";
      appointment.stripePaymentIntentId = paymentIntentId;
      appointment.paymentDate = new Date();

      await appointment.save();

      await appointment.populate(
        "doctorId",
        "name specialization fees hospitalInfo profileImage",
      );
      await appointment.populate("patientId", "name email phone profileImage");

      res.ok(
        appointment,
        "Payment confirmed and appointment confirmed succesfully",
      );
    } catch (error) {
      res.serverError("Failed to confirm payment", [error.message]);
    }
  },
);

// Simple payment confirmation endpoint (for demo without Stripe SDK on client)
router.post(
  "/confirm-appointment-payment",
  authenticate,
  requireRole("patient"),
  [
    body("appointmentId")
      .isMongoId()
      .withMessage("valid appointment ID is required"),
  ],
  validate,
  async (req, res) => {
    try {
      const { appointmentId } = req.body;

      // Find appointment
      const appointment = await Appointment.findById(appointmentId)
        .populate(
          "doctorId",
          "name specialization fees hospitalInfo profileImage",
        )
        .populate("patientId", "name email phone profileImage");

      if (!appointment) {
        return res.notFound("Appointment not found");
      }

      if (appointment.patientId._id.toString() !== req.user._id.toString()) {
        return res.error("Unauthorized", 403);
      }

      if (appointment.paymentStatus === "Paid") {
        return res.ok(appointment, "Payment already completed");
      }

      // Update appointment with payment details
      appointment.paymentStatus = "Paid";
      appointment.paymentMethod = "Online";
      appointment.paymentDate = new Date();

      await appointment.save();

      res.ok(
        appointment,
        "Payment confirmed and appointment confirmed successfully",
      );
    } catch (error) {
      res.error(error.message, 500);
    }
  },
);

module.exports = router;
