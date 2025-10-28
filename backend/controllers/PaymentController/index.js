const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id:process.env.RAZORPAY_API_KEY,
  key_secret:process.env.RAZORPAY_API_SECRET,
});

export const ProcessPayment=async(req,res)=>{
   
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

