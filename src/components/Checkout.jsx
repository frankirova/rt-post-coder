import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CartContext } from "../Context/CartContext";
import { ToastContainer, toast } from "react-toastify";

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
      position: "top-right",
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
        position: "top-right",
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

  if (isLoading) return <h1>Generando orden...</h1>;

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center vh-100">
      <Link to="/send" className="btn btn-success">
        ea
      </Link>
      <h1> Checkout </h1>

      <p>Ingrese los siguientes datos para confirmar su orden :</p>

      <form
        onSubmit={handleSubmit}
        className="d-flex flex-column align-items-center justify-content-center"
      >
        <input
          type="text"
          className="my-3"
          id="name"
          placeholder="Name:"
          name="name"
          value={values.name}
          onChange={handleChange}
        />
        <input
          type="text"
          className="my-3"
          id="phone"
          placeholder="Phone:"
          name="phone"
          value={values.phone}
          onChange={handleChange}
        />
        <input
          type="text"
          className="my-3"
          id="email"
          placeholder="Mail:"
          name="email"
          value={values.email}
          onChange={handleChange}
        />
      </form>
      <button className="btn btn-success" onClick={handleCreateOrder}>
        Terminar orden
      </button>
      <ToastContainer />
    </div>
  );
};
