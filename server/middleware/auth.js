import { clerkClient, getAuth } from "@clerk/express";

export const auth = async (req, res, next) => {
    try {
        const { userId, has } = getAuth(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Please sign in.",
            });
        }

        let hasPremiumPlan = false;
        if (typeof has === "function") {
            try {
                hasPremiumPlan = await has({ plan: "premium" });
            } catch {
                // Clerk Billing may not be enabled yet
                hasPremiumPlan = false;
            }
        }

        const user = await clerkClient.users.getUser(userId);
        req.free_usage = Number(user.privateMetadata?.free_usage) || 0;
        req.plan = hasPremiumPlan ? "premium" : "free";
        next();
    } catch (error) {
        console.error("Auth middleware error:", error.message);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
