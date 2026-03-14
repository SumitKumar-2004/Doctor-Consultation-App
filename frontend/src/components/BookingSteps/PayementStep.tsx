import { httpService } from "@/service/httpService";
import { userAuthStore } from "@/store/authStore";
import React, { useEffect, useRef, useState } from "react";
import { Separator } from "../ui/separator";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  CreditCard,
  Loader2,
  Shield,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface PaymentStepInterface {
  selectedDate: Date | undefined;
  selectedSlot: string;
  consultationType: string;
  doctorName: string;
  slotDuration: number;
  consultationFee: number;
  isProcessing: boolean;
  onBack: () => void;
  onConfirm: () => void;
  onPaymentSuccess?: (appointment: any) => void;
  loading: boolean;
  appointmentId?: string;
  patientName?: string;
}

const PayementStep = ({
  selectedDate,
  selectedSlot,
  consultationType,
  doctorName,
  slotDuration,
  consultationFee,
  isProcessing,
  onBack,
  onConfirm,
  onPaymentSuccess,
  loading,
  appointmentId,
  patientName,
}: PaymentStepInterface) => {
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "failed"
  >("idle");
  const { user } = userAuthStore();
  const [error, setError] = useState<string>("");
  const [isPaymentLoading, setIsPaymentLoading] = useState<boolean>(false);
  const platformFees = Math.round(consultationFee * 0.1);
  const totalAmount = consultationFee + platformFees;
  const [stripeFormOpen, setStripeFormOpen] = useState(false);

  // Payment form states
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [showCvv, setShowCvv] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("visa");

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.slice(0, 2) + "/" + v.slice(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiryDate(formatExpiryDate(e.target.value));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/gi, "").slice(0, 4);
    setCvv(value);
  };

  const isPaymentFormValid = () => {
    return (
      cardholderName.trim() !== "" &&
      cardNumber.replace(/\s/g, "").length === 16 &&
      expiryDate.length === 5 &&
      cvv.length >= 3
    );
  };

  // Create payment intent when payment form is opened
  const createPaymentIntent = async () => {
    if (!appointmentId) {
      setError("Appointment ID is missing");
      setPaymentStatus("failed");
      return;
    }

    try {
      setIsPaymentLoading(true);
      const response = await httpService.postWithAuth(
        "/payment/create-payment-intent",
        { appointmentId },
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to create payment intent");
      }

      return response.data;
    } catch (err: any) {
      console.error("Error creating payment intent:", err);
      setError(err.message || "Failed to create payment intent");
      setPaymentStatus("failed");
      setIsPaymentLoading(false);
    }
  };

  const handleOpenStripeForm = async () => {
    if (!appointmentId || !patientName) {
      onConfirm();
      return;
    }

    setStripeFormOpen(true);
    const paymentIntentData = await createPaymentIntent();
    if (!paymentIntentData) {
      setStripeFormOpen(false);
    }
  };

  const handlePayment = async () => {
    if (!appointmentId || !patientName) {
      onConfirm();
      return;
    }

    try {
      setIsPaymentLoading(true);
      setError("");
      setPaymentStatus("processing");

      // For demo: directly confirm payment
      // In production, would use Stripe Elements/Payment Element
      const response = await httpService.postWithAuth(
        "/payment/confirm-appointment-payment",
        { appointmentId },
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to process payment");
      }

      setPaymentStatus("success");

      // Call success callback if provided
      if (onPaymentSuccess) {
        onPaymentSuccess(response.data);
      }

      // Auto redirect after 2 seconds
      setTimeout(() => {
        onPaymentSuccess?.(response.data);
      }, 2000);
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.message || "Payment failed");
      setPaymentStatus("failed");
      setIsPaymentLoading(false);
    }
  };

  const [autoProcessPayment, setAutoProcessPayment] = useState(false);

  // Auto-process payment when appointment is created
  useEffect(() => {
    if (
      autoProcessPayment &&
      appointmentId &&
      patientName &&
      paymentStatus === "idle"
    ) {
      handlePayment();
      setAutoProcessPayment(false);
    }
  }, [appointmentId, autoProcessPayment]);

  const handlePaynow = async () => {
    // Show payment form directly
    setShowPaymentForm(true);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Payment & Confirmation
        </h3>
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h4 className="font-semibold text-gray-900 mb-4">Booking Summary</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Date & Time</span>
              <span className="font-medium">
                {selectedDate?.toLocaleDateString()} at {selectedSlot}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Consultation Type</span>
              <span className="font-medium">{consultationType}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Doctor</span>
              <span className="font-medium">{doctorName}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Duration</span>
              <span className="font-medium">{slotDuration} minutes</span>
            </div>

            <Separator />

            <div className="flex justify-between">
              <span className="text-gray-600">Consultation Fee</span>
              <span className="font-medium">₹{consultationFee}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Platform Fee (10%)</span>
              <span className="font-medium">₹{platformFees}</span>
            </div>

            <Separator />

            <div className="flex justify-between text-lg">
              <span className="font-semibold">Total Amount</span>
              <span className="font-bold text-green-600">₹{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Stripe Payment Info */}
        {appointmentId && patientName && paymentStatus === "idle" && (
          <div className="bg-blue-50 rounded-lg p-6 mb-8 border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
              Secure Payment with Stripe
            </h4>
            <p className="text-gray-600 text-sm mb-4">
              Your payment is processed securely through Stripe. No card details
              are stored on our servers.
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>✓ Secure SSL Encrypted Connection</li>
              <li>✓ PCI DSS Compliant</li>
              <li>✓ Multiple Payment Methods Supported</li>
              <li>✓ Instant Payment Confirmation</li>
            </ul>
          </div>
        )}

        {/* Payment Details Form */}
        {showPaymentForm && paymentStatus === "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-lg p-8 mb-8 border-2 border-blue-200 shadow-lg"
          >
            <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <CreditCard className="w-6 h-6 mr-2 text-blue-600" />
              Payment Details
            </h4>

            {/* Payment Method Selection */}
            <div className="mb-8">
              <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                Select Payment Method
              </Label>
              <div className="flex gap-4">
                {[
                  { id: "visa", name: "Visa" },
                  { id: "mastercard", name: "Mastercard" },
                  { id: "amex", name: "Amex" },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex items-center justify-center px-6 py-3 rounded-lg border-2 font-semibold transition-all ${
                      paymentMethod === method.id
                        ? "border-blue-600 bg-blue-50 text-blue-600"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    {method.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Cardholder Name */}
            <div className="mb-6">
              <Label
                htmlFor="cardholder"
                className="text-sm font-semibold text-gray-700 mb-2 block"
              >
                Cardholder Name
              </Label>
              <Input
                id="cardholder"
                type="text"
                placeholder="Enter name as shown on card"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                className="text-lg py-3 border-gray-300 focus:border-blue-500"
              />
            </div>

            {/* Card Number */}
            <div className="mb-6">
              <Label
                htmlFor="cardnumber"
                className="text-sm font-semibold text-gray-700 mb-2 block"
              >
                Card Number
              </Label>
              <Input
                id="cardnumber"
                type="text"
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                value={cardNumber}
                onChange={handleCardNumberChange}
                className="text-lg py-3 border-gray-300 focus:border-blue-500 tracking-wider"
              />
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="expiry"
                  className="text-sm font-semibold text-gray-700 mb-2 block"
                >
                  Expiration Date
                </Label>
                <Input
                  id="expiry"
                  type="text"
                  placeholder="MM / YY"
                  maxLength={5}
                  value={expiryDate}
                  onChange={handleExpiryChange}
                  className="text-lg py-3 border-gray-300 focus:border-blue-500"
                />
              </div>
              <div>
                <Label
                  htmlFor="cvv"
                  className="text-sm font-semibold text-gray-700 mb-2 block"
                >
                  Security Code
                </Label>
                <div className="relative">
                  <Input
                    id="cvv"
                    type={showCvv ? "text" : "password"}
                    placeholder="CVV"
                    maxLength={4}
                    value={cvv}
                    onChange={handleCvvChange}
                    className="text-lg py-3 border-gray-300 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCvv(!showCvv)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCvv ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 mt-8">
              <Button
                variant="outline"
                onClick={() => setShowPaymentForm(false)}
                className="flex-1 py-3 text-base"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                disabled={!isPaymentFormValid() || isPaymentLoading}
                className="flex-1 py-3 text-base bg-green-600 hover:bg-green-700"
              >
                {isPaymentLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pay ₹{totalAmount}
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {paymentStatus === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-12"
            >
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Processing Payment...
              </h4>
              <p className="text-gray-600 mb-4">
                Please wait while we process your payment securely with Stripe
              </p>
              <Progress value={50} className="w-full" />
            </motion.div>
          )}

          {paymentStatus === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-12"
            >
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h4 className="text-lg font-semibold text-green-800 mb-2">
                Payment Successful!
              </h4>
              <p className="text-gray-600 mb-4">
                Your appointment has been confirmed. You will receive a
                confirmation email shortly.
              </p>
            </motion.div>
          )}

          {paymentStatus === "failed" && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-12"
            >
              <XCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
              <h4 className="text-lg font-semibold text-red-800 mb-2">
                Payment Failed!
              </h4>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button
                onClick={() => {
                  setPaymentStatus("idle");
                  setError("");
                  setStripeFormOpen(false);
                }}
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg mb-8">
          <Shield className="w-6 h-6 text-green-600" />
          <div>
            <p className="font-medium text-green-800">Secure Payment</p>
            <p className="text-sm text-green-700">
              Your payment is protected by Stripe's 256-bit SSL encryption
            </p>
          </div>
        </div>
      </div>

      {paymentStatus === "idle" && !showPaymentForm && (
        <div className="flex justify-between gap-2">
          <Button variant="outline" onClick={onBack} className="px-8 py-3">
            Back
          </Button>
          <Button
            onClick={handlePaynow}
            disabled={loading || isPaymentLoading}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-lg font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span className="text-sm md:text-lg">
                  Creating Appointment...
                </span>
              </>
            ) : isPaymentLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span className="text-sm md:text-lg">Processing...</span>
              </>
            ) : appointmentId && patientName ? (
              <>
                <CreditCard className="w-5 h-5 mr-2 " />
                <span className="text-sm md:text-lg">
                  Pay ₹{totalAmount} & Confirm
                </span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2 " />
                <span className="text-sm md:text-lg">
                  Pay ₹{totalAmount} & Book
                </span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PayementStep;
