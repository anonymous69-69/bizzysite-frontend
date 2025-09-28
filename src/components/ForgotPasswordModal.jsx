import { useState } from 'react';
import { motion } from 'framer-motion';

const ForgotPasswordModal = ({ onClose }) => {
    const [resetEmail, setResetEmail] = useState("");
    const [isSendingReset, setIsSendingReset] = useState(false);
    const [message, setMessage] = useState("");

    const handleResetRequest = async () => { /* Reset logic is unchanged */ };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.2 } }}
                className="bg-gray-900/80 backdrop-blur-xl rounded-xl shadow-2xl max-w-md w-full mx-auto border border-gray-700 p-8"
                onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true"
            >
                <h2 className="text-2xl font-bold mb-6 text-white text-center">Reset Your Password</h2>
                {message ? (
                    <div className="text-center">
                        <p className="text-green-400">{message}</p>
                        <button onClick={onClose} className="mt-4 w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors">Close</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-center text-gray-400 text-sm">Enter your email and we'll send a link to reset your password.</p>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Email address</label>
                            <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-700 rounded-md bg-gray-800/70 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="your@email.com" />
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-700 text-white font-medium rounded-md hover:bg-gray-600 transition-colors" disabled={isSendingReset}>Cancel</button>
                            <button type="button" onClick={handleResetRequest} className="flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400" disabled={isSendingReset}>{isSendingReset ? "Sending..." : "Send Reset Link"}</button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPasswordModal;