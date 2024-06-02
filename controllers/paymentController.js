import cryptoJs from "crypto-js"
import { Payment } from "../models/payment.model.js";
import {instance, kafka} from "../server.js"
import { Partitioners } from "kafkajs";

export const razorpayKey=async(req,res,next)=>{
    res.status(200).json({
        "success":true,
        key:process.env.RAZORPAY_KEY
    })
}
export const createOrder = async (req, res) => {
  console.log("inside order")
  const consumer=kafka.consumer({groupId:"order-service"});
    try {
      const {medicines}=req.body;
      if(medicines.length==0){
        return res.status(400).json({message:"Please add medicines to cart"})
      }
      const options = {
        amount: Number(req.body.amount * 100),
        currency: "INR",
      };
      const producer=kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });
      await producer.connect()

      const message = {
        user: req.user._id,
        medicines: medicines,
        value: "CREATE_ORDER"
      };

      await producer.send({
        topic: 'order-create',
        messages: [
          { value: JSON.stringify(message) }
        ],
      })
      let orderId;
      await producer.disconnect();
      const order = await instance.orders.create(options);
      console.log(order);
      await consumer.connect()
      await consumer.subscribe({ topic: 'order-success', fromBeginning: true })
      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          const orderMessage=JSON.parse(message.value.toString());
          console.log(orderMessage)
          console.log({topic,partition},orderMessage.order)
          orderId=orderMessage.order
          res.status(200).json({
            success: true,
            order,
            createdOrder:orderId
          });
          
        },
        
      })
      //await consumer.disconnect();
      
      
    } catch (error) {
      //await consumer.disconnect();
      res.status(402).json({
        success: false,
        message:"error "+error.message,
        error:error,
      });
    }
}

export const paymentVerification = async (req, res) => {
    try {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
        req.body;
  
      const body = razorpay_order_id + "|" + razorpay_payment_id;

      console.log(body)
  
      // const expectedSignature = crypto
      //   .createHmac("sha256", process.env.RAZORPAY_SECRET)
      //   .update(body.toString())
      //   .digest("hex");
      // console,log("expected sign ",expectedSignature);

      const generated_signature =await cryptoJs.HmacSHA256(razorpay_order_id + "|" + razorpay_payment_id, process.env.RAZORPAY_SECRET).toString();

      console.log("generated sign ",generated_signature);
      
      const isAuthentic = generated_signature === razorpay_signature;
      console.log(isAuthentic);
      if (isAuthentic) {
        const newPayment = await Payment.create(
            {razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature}
        );

        console.log(newPayment);
  
        res.redirect(
          `http://localhost:3000/payment-success?reference=${razorpay_payment_id}`
        );
      } else {
        res.status(400).json({
          success: false,
        });
      }
    } catch (error) {
      res.status(404).json({
        success: false,
        error:error.message,
      });
    }
  };

  