const { Schema, model } = require('mongoose');

const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }, 
    items : [
        {
            productId: {type: Schema.Types.ObjectId, ref: "Product", required: true},
            name: String,
            price: Number,
            quantity: Number
        }
    ],
    total: {
        type: Number,
        required: true
    },
    // Manejar el estado de la orden
    paymentMethod: {
        type: String,
        enum: ["paypal", "mercadopago", "wompi"],
        required: true
    },
    isPid: {
        type: Boolean,
        default: false
    },
    // el paiAT es para saber si el pago fue exitosos o no
    paiAT:{
        type: Date
    },
    // esto es para la fecha de la orden
    createdAT:{
        type: Date,
        default: Date.now
    }
    
});

// se exporta el modelo de la base de datos
module.exports = model("Order", orderSchema);
