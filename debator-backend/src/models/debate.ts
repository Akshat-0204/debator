import mongoose, { Schema, Document } from "mongoose";

export interface IDebate extends Document {
  sessionId: string;
  motion: string; //yeh for/against decide krega
  forModel: string;
  againstModel: string;
  judgeModel: string;
  status: "active" | "completed" | "error" | "stopped";
  currentRound: number;
  maxRounds: number;
  updatedAt: Date;
  createdAt?: Date;
}

const debateSchema : Schema = new Schema({
    sessionId : {type : String ,unique : true, index : true , required : true},
    motion : {type : String , required : true},
    forModel : {type : String , required : true},
    againstModel : {type : String , required : true},
    judgeModel : {type : String , required : true},
    status : {type : String , enum : ["active" , "completed" , "error" , "stopped"] ,default : "active" },
    currentRound : {type : Number , required : true},
    maxRounds : {type : Number , required : true},
    updatedAt : {type : Date , default : Date.now},
    createdAt : {type : Date , default : Date.now},
})

export default mongoose.model<IDebate>("Debate" , debateSchema);
