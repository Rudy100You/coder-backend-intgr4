import { __src_dirname, pathJoin } from "../../utils/utils.js";

export default {
    definition:{
        openapi:'3.0.1',
        info:{
            title:"RS EcommerceAPI",
            description:"API docs de Rs Ecommerce"
        }
    },
    apis:[pathJoin(__src_dirname,'docs',"*","*.yaml")]
}