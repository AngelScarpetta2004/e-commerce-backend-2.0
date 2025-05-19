const Order = require("../models/order.model");


const createOrder = async ( req, res ) => {
    const {items, total, paymentMethod} = req.body;
    const user = req.uid;

    try{
        const newOrder = new Order ({user, items, total, paymentMethod});
        await newOrder.save();
        res.status(201).json({ok: true, order: newOrder});
    }catch (error){
        res.status(500).json({ok: false, msg: " Error al crear la orden", error});

    }
};

const getOrders = async ( req, res ) => {
    try{
        const orders = await Order.find({user: req.uid}).sort({createdAt: -1});
        res.json({ok: true, orders});
    }catch (error){
        res.status(500).json({ok: false, msg: "error al obtener las ordenes", error});

    }
};

module.exports = {
    createOrder,
    getOrders
};