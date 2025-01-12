import {resend} from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";
import { url } from "inspector";

export async function sendVerificationEmail(email: string, username:string, verifyCode: string): Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: " Mystry message | Verification code",
            react: VerificationEmail({username, otp:verifyCode})
        })
        return {
            success: true,
            message: "Verification email send successfully",
            split: (arg0: string) => { return null; }
        }
    } catch (emailError) {
        console.error("Error sending verification email", emailError)
        return {
            success: false,
            message: "Failed to send verification email",
            split: (arg0: string) => { return null; }
        }
    }
}


