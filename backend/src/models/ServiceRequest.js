const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema(
{
  clientId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },

  assignedProfessionalId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    default:null
  },

  title:{
    type:String,
    required:true
  },

  description:{
    type:String,
    required:true
  },

  requiredSkills:[{ type:String }],

  budget:{ type:Number },

  currency:{
    type:String,
    default:"USD"
  },

  deadline:{ type:Date },

  status:{
    type:String,
    enum:["submitted","under_review","approved","rejected","converted","assigned"],
    default:"submitted"
  }

},
{ timestamps:true }
);

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);