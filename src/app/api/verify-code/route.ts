import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

export async function POST(request: Request){
    await dbConnect()

    try {
        const {username, code} = await request.json()
        console.log("username", username, "code", code)

        const decodedUsername = decodeURIComponent(username)
        const user = await UserModel.findOne({username: decodedUsername})

        if(!user){
            return Response.json({
                success: false,
                message: "User not found"
            }, {status: 500})
        }

        const isCodeValid = user.verifyCode === code
        const isCodeNotExpired = new Date(user.verifyCodeExpires) > new Date()

        if(isCodeValid && isCodeNotExpired){
            user.isVerified = true
            await user.save()

            return Response.json({
                success: true,
                message: "User verified successfully"
            },{status: 200})
        }

        if(!isCodeValid){
            return Response.json({
                success: false,
                message: "Invalid code"
            }, {status: 400})
        }

        if(!isCodeNotExpired){
            return Response.json({
                success: false,
                message: "Code is expired"
            }, {status: 400})
        }
    } catch (error) {
        console.log("Error verifying user", error)
        return Response.json({
            success: false,
            message: "Error verifying user"
        }, {status: 500})
    }
}