import sql from "../configs/db.js";


export const getUserCreations = async(req,res) =>{

    try {
        const {userId} = req.auth();

       const creations = await sql`select * from creations where user_id = ${userId} order by created_at desc`

       res.json({
        success : true,creations})
        
    } catch (error) {

        res.json({
            success : false,
            message : error.message
        })
        
    }
}
export const getPublishedCreations = async(req,res) =>{

    try {
        

       const creations = await sql`select * from creations where publish = true order by created_at desc`;

       res.json({
        success : true,creations})
        
    } catch (error) {

        res.json({
            success : false,
            message : error.message
        })
        
    }
}
export const toggleLikeCreations = async(req,res) =>{

    try {

        const {userId} = req.auth();
        const{id} = req.body;

        const [creation] = await sql`select * from creations where id = {id}`;

        if(!creation){
            return res.json({
                success : false,
                message : "Creations not found"
            })

        }

        const currentLikes = creation.likes;
        const userIdstr = userId.toString();
        let updateLikes;
        let messsage;

        if(currentLikes.includes(userIdstr)){
            updatedLikes = currentLikes.filter(() => user !== userIdstr);
            messsage = "creation unliked"
        }
        else{
            updatedLikes = [...currentLikes,userIdstr];
            message = 'Creation liked'
        }

        const formattedArray = `{${updatedLikes.json(',')}}`

        await sql`update creations set likes = ${formattedArray} :: text[] where id = ${id}`;

         
        


       res.json({
        success : true,messsage})
        
    } catch (error) {

        res.json({
            success : false,
            message : error.message
        })
        
    }
}