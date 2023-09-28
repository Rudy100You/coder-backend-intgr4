export const generateNotFoundEntityDescription = (entity)=>
    `Error: [${entity}] could not be found or retrieved from data source`

    export const generateUserCanNotAddOwnedProductDescription = (user, product)=>`User [${user.email}] is not allowed to add their own product (${product}) to cart`