import fastify from "fastify";

const app = fastify()

app.get('/test',(req,res)=>{
    res.send({
        "msg":"up"
    })
})

app.listen({port:3000},()=>{
    console.log("Server is listening on http://localhost:3000");
    
})