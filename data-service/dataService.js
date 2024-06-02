import { Partitioners } from "kafkajs";
import Doctor from "../models/doctor.model.js";
import Patient from "../models/patient.model.js";
import {kafka} from "../server.js"



const run = async () => {
    const producer=kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });
    const consumer=kafka.consumer({groupId:"data-service"});
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({ topic: 'user-data', fromBeginning: true });
  
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        let info=JSON.parse(message.value.toString());
        console.log("info->> ",info);
        let user;
        if(info.role=="user"){
            user=await Patient.findById(info.id);
            if(user){
                console.log(user)
                await producer.send({
                    topic:'data-success',
                    messages:[{value:JSON.stringify(user)}]
                })
                 
                // Saga completed successfully
                console.log(`Saga completed for data`);
            }
        }
        else if(info.role==="doctor"){
            user=await Doctor.findById(info.id);
            if(user){
                console.log(user)
                await producer.send({
                    topic:'data-success',
                    messages:[{value:JSON.stringify(user)}]
                })
                 
                // Saga completed successfully
                console.log(`Saga completed for data`);
            }
        }
       
      },
    });
  };

  export const runDataService=async()=>{
    run().catch(console.error);
  }
  
  
