const Bill = require('../models/Bill');
const dotenv = require('dotenv');
const twilio = require('twilio');

dotenv.config();

// Initialize Twilio client
const accountSid = 'AC5275d6cf6b7cc0e6ac510556ac936dd9';
const authToken = process.env.Auth_Token;
const client = twilio(accountSid, authToken);

exports.addBill = async(req,res) => {
    try{
        const {name, mobile, address, medicines, totalPrice, totalBuyingPrice} = req.body;

        // Validate total buying price
        if (!totalBuyingPrice) {
            return res.status(400).json({
                success: false,
                message: 'Total buying price is required'
            });
        }

        // Create new bill
        const newBill = new Bill({
            name,
            mobile,
            address,
            medicines,
            price: totalPrice,
            totalBuyingPrice: totalBuyingPrice
        });

        // Save bill to database
        const savedBill = await newBill.save();

        // Prepare SMS message
        let messageText = `Dear ${name},\n\nYour bill details:\n`;
        medicines.forEach(med => {
            messageText += `${med.name}: ${med.quantity} units\n`;
        });
        messageText += `\nTotal Price: ₹${totalPrice}\n`;
        messageText += `Thank you for your purchase!`;

        await client.messages.create({
            body: messageText,
            to: `+91${mobile}`,
            from: '+19124831815'
        });

        res.status(201).json({
            success: true,
            message: 'Bill generated and SMS sent successfully',
            bill: savedBill
        });

    }
    catch(error){
        console.error('Bill generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate bill',
            error: error.message
        });
    }
};

exports.viewBills = async(req,res) => {
    try{
        const response = await Bill.find();
        res.status(200).json({
            data:response
        });
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: "Server error. Please try again.",
            error: error.message
        });
    }
}