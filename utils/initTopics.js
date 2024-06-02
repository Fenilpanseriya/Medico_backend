import { kafka } from "../server.js"


const initTopics=async ()=>{
    const admin = kafka.admin();
    console.log("admin connecting");
    await admin.connect();
    console.log("admin connected");

    await admin.createTopics({
        topics:[
            {
                topic: 'order-create',
                numPartitions: 2,
            },{
                topic: 'order-success',
                numPartitions: 2,
            },
            {
                topic:"user-data",
                numPartitions:2
            },
            {
                topic:"data-success",
                numPartitions:2
            },
            {
                topic:"rollback-init",
                numPartitions:1
            },
            {
                topic:"rollback-success",
                numPartitions:1
            }
        ]
    })
    console.log("topics created ");
    await admin.disconnect();
}

export default initTopics;