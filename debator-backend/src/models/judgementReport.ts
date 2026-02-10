import mongoose , {Schema , Document}  from "mongoose";

interface IScore {
    logicalConsistency : number;
    evidenceUsage : number ;
    clarity : number;
    rebuttalStrength : number;

}



export interface IReport extends Document {
    debateId : string;
    judgeModel : string;
    verdict : string ;
    forScore : IScore;
    againstScore : IScore;
    insights : string[];
    fallacies : string[];
    keyQuotes : string[];
    summary : string;
    timestamp : Date;

    
}

const scoreSchema = new Schema({
     logicalConsistency : {type : Number , min : 0 , max : 10 },
    evidenceUsage : {type : Number , min : 0 , max : 10  },
    clarity : {type : Number , min : 0 , max : 10 },
    rebuttalStrength : {type : Number , min : 0 , max : 10 },
})

const reportSchema : Schema = new Schema({
    debateId : {type : String , required : true},
    judgeModel : {type : String , required : true},
    verdict : {type : String , required : true},
    forScore : {type : scoreSchema , required : true},
    againstScore : {type : scoreSchema , required : true},
    insights : [{type : String}],
    fallacies : [{type : String}],
    keyQuotes : [{type : String}],
    summary : {type : String , required : true},
    timestamp : {type : Date , default : Date.now},
})

export default mongoose.model<IReport>("JudgeReport" , reportSchema);
