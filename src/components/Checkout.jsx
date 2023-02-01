import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../Context/CartContext";
import { ToastContainer, toast } from "react-toastify";
import { Spinner } from "./Spinner";

import { addOrder, getProductsAddedToCart } from "../services/Firestore/orders";
import { writeBatch } from "firebase/firestore";
import { db } from "../services/firebaseConfig";

export const Checkout = () => {
  const [values, setValues] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const { cart, getTotal, clearCart } = useContext(CartContext);

  const handleChange = (e) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateOrder = async () => {
    setIsLoading(true);
    try {
      const order = {
        buyer: {
          name: values.name,
          phone: values.phone,
          email: values.email,
        },
        items: cart,
        total: getTotal(),
      };

      const batch = writeBatch(db);
      const prodOfStock = [];

      const idProdAddedToCart = cart.map((prod) => prod.id);

      const prodAddedToCartFromFirestore = await getProductsAddedToCart(
        idProdAddedToCart
      );
      const { docs } = prodAddedToCartFromFirestore;

      docs.forEach((doc) => {
        const docData = doc.data();
        const stockDb = docData.stock;

        const productAddedToCart = cart.find((prod) => prod.id === doc.id);
        const prodQuantity = productAddedToCart.quantity;

        if (stockDb >= prodQuantity) {
          batch.update(doc.ref, { stock: stockDb - prodQuantity });
        } else {
          prodOfStock.push({ id: doc.id, ...docData });
        }
      });

      if (prodOfStock.length === 0) {
        await batch.commit();
        addOrder(order);
        notifyCreateOrderSuccess();
        clearCart();
        navigate("/");
      } else {
        notifyErrorCreateOrder();
      }
    } catch (error) {
      notifyErrorCreateOrder();
    } finally {
      setIsLoading(false);
    }
  };

  const notifyCreateOrderSuccess = () => {
    toast.success("🦄 Order created successfully", {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  const notifyErrorCreateOrder = () => {
    toast.error(
      "Error creating order, check the stock of the product and try again",
      {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      }
    );
  };

  if (isLoading) return <Spinner />;

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="container">
      <h2 className="titulo my-2 text-center">Checkout</h2>
      <div className="container d-flex flex-column align-items-center justify-content-start vh-100">
        <p className="my-3">Ingrese los siguientes datos para confirmar su orden :</p>
        <form
          onSubmit={handleSubmit}
          className="w-50 d-flex flex-column my-3 justify-content-center"
        >
          <label className="text-start">Nombre</label>
          <input
            type="text"
            className="my-3"
            id="name"
            name="name"
            value={values.name}
            onChange={handleChange}
          />
          <label className="text-start">Telefono</label>
          <input
            type="text"
            className="my-3"
            id="phone"
            name="phone"
            value={values.phone}
            onChange={handleChange}
          />
          <label className="text-start">Mail</label>
          <input
            type="text"
            className="my-3"
            id="email"
            name="email"
            value={values.email}
            onChange={handleChange}
          />
          <button className="btn btn-success" onClick={handleCreateOrder}>
            Finish order
          </button>
        </form>

        <ToastContainer />
      </div>
    </div>
  );
};
