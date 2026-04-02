const { successResponse, errorResponse } = require("../utils/apiResponse");
const sendEmail = require("../utils/sendEmail");

/**
 * @desc    Submit feedback form
 * @route   POST /api/feedback
 * @access  Public
 */
const submitFeedback = async (req, res) => {
    try {
        const { name, email, topic, rating, message } = req.body;

        if (!name || !email || !message) {
            return errorResponse(res, 400, "Name, email, and message are required fields");
        }

        const subject = `IntelliHire New Feedback Action: ${topic}`;
        const text = `
New feedback submitted via IntelliHire:

Name: ${name}
Email (Sender): ${email}
Topic: ${topic}
Rating: ${rating}/5

Message:
${message}
        `;

        const html = `
            <h2>New Feedback Received</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>From Email:</strong> ${email}</p>
            <p><strong>Topic:</strong> ${topic}</p>
            <p><strong>Rating:</strong> ${rating}/5  ⭐</p>
            <hr />
            <h3>Message</h3>
            <p style="white-space: pre-wrap;">${message}</p>
            <br />
            <p><em>This email was generated from the IntelliHire platform.</em></p>
        `;

        const isSent = await sendEmail(subject, text, html);

        // Even if email fails (perhaps not configured yet), return a success to the user 
        // to not break the frontend form behavior. Warnings are logged on the server.
        return successResponse(res, 200, "Feedback submitted successfully!");
    } catch (error) {
        return errorResponse(res, 500, "Server error trying to send feedback email.");
    }
};

module.exports = { submitFeedback };
