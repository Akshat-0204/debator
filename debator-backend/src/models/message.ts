import mongoose , {Schema, Document} from "mongoose";
export interface IMessage extends Document {
    debateId : string ;
    role : "for" | "against" 
    modelName : string;
    content : string;
    turnNumber : number;
    timeStamp : Date;
    tokenCount? : number;
}

const MessageSchema : Schema = new Schema({
    debateId : {type : String , required : true},
    role : {type : String , enum : ["for" , "against"] , required : true},
    modelName : {type : String , required : true},
    content : {type : String , required : true},
    turnNumber : {type : Number , required : true},
    timeStamp : {type : Date , default : Date.now},
    tokenCount : {type : Number}
})

export default mongoose.model<IMessage>("Message" , MessageSchema);
