const express = require('express');
const { authMiddleware } = require('../middleware');
const { Account } = require('../db');
const { default: mongoose } = require('mongoose');
const router = express.Router();

router.get('/balance', authMiddleware, async(req, res) => {
    const account = await Account.findOne({
        userId: req.userId  
    })

    res.json({
        balance: account.balance
    })
})

router.post('/transfer', async (req, res) => {

    const session = await mongoose.startSession();

    session.startTransaction();

    const {amount, to} = req.body;

    const account = await Account.findOne({_id: req.userId}).session(session);

    if(!account || account.balance < amount){
        await session.abortTransaction();
        return res.status(400).json({
            message: "Insufficient balance"
        })
    }

    const toAccount = await Account.findOne({userId: _id}).session(session);

    if(!toAccount){
        await session.abortTransaction();
        return res.status(400).json({
            message: "Invalid account"
        })
    }

    await Account.updateOne({userId: req.userId}, {$inc: {$balance: -amount}}).session(session);
    await Account.updateOne({userId: to}, {$inc: {$balance: amount}}).session(session);

    await session.commitTransaction();
    res.json({
        message: "Transfer successfull"
    })

})

module.exports = router;