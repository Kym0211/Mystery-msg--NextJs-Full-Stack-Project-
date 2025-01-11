import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import mongoose from "mongoose";

export async function GET(request: Request){
    await dbConnect()

    const session = await getServerSession(authOptions)
    const user: User = session?.user as User

    if(!session || !session.user){
        return Response.json({
            success: false, 
            message: "Unauthorized"
        }, {status: 401})
    }

    const userId = new mongoose.Types.ObjectId(user._id)
    try {
        const user = await UserModel.aggregate([
            { $match: { _id: userId } },
            { 
                $addFields: { 
                    messages: { $ifNull: ["$messages", []] } // Ensure messages is always an array
                }
            },
            { $unwind: { path: "$messages", preserveNullAndEmptyArrays: true } }, // Unwind safely
            { $sort: { "messages.createdAt": -1 } },
            { 
                $group: { 
                    _id: "$_id", 
                    messages: { $push: "$messages" } 
                }
            }
        ]);
        if(!user){
            return Response.json({
                success: false, 
                message: "User not found"
            }, {status: 404})
        }
        console.log("user from get messages :-", user)
        return Response.json({
            success: true, 
            messages: user[0].messages
        }, {status: 200})
        
    } catch (error) {
        console.log("Error getting messages", error, user) 
        return Response.json({
            success: false, 
            message: "Error getting messages"
        }, {status: 500})
        
    }
}