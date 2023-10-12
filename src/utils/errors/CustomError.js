export default class CustomError{
    static throwNewError({name="Error", cause="", message ="",status = 500, customParameters}){
        const error = new Error(message, {cause});
        error.name = name;
        error.status = status;
        if(customParameters)
            Object.keys(customParameters).forEach((parameterName, idx)=>{
                error[parameterName.toString()] = customParameters[idx];
            });
        throw error;
    }
}