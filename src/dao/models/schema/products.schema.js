import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2"

const productSchema = mongoose.Schema({
    title: {
      type: String,
      required:true
    },
    description: {
      type: String
    },
    code: {
      type: String,
      required:true,
      unique:true
    },
    price: {
      type: Number,
      required:true
    },
    status: {
      type: Boolean,
    },
    stock: {
      type: Number
    },
    category: {
      type: String
    },
    owner:{
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      default:"adminCoder@coder.com"
    },
    thumbnails: {
      type: [
        String
      ]
    }
  },{versionKey:false})

  productSchema.plugin(mongoosePaginate)
  export {productSchema}