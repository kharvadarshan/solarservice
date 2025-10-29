import Razorpay from 'razorpay';
import crypto  from 'crypto';

const razorpay = new Razorpay({
  key_id:process.env.RAZORPAY_API_KEY,
  key_secret:process.env.RAZORPAY_API_SECRET,
});

export const processPayment=async(req,res)=>{
   
    const options={
        amount:Number(req.body.amount*100),
        currency:"INR"
    }

    const order = await razorpay.orders.create(options);

    res.status(200).json({
        success:true,
        order
    })
};

export const getKey = async(req,res)=>{
    res.status(200).json({
        key:process.env.RAZORPAY_API_KEY,
    })
};

export const paymentVerification=async(req,res)=>{
    
    const { 
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature }  = req.body;

    const body = razorpay_order_id + "|"+razorpay_payment_id;

    const expectedSignature =  crypto.createHmac("sha256",process.env.RAZORPAY_API_SECRET).update(body.toString()).digest("hex");

    const isAuthentic = expectedSignature===razorpay_signature;

    if(isAuthentic)
    {
        return res.status(200).json({success:true});
    }else{
        res.status(400).json({success:false});
    }
}

