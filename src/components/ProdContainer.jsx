import { useParams } from "react-router-dom";
import { useGetProds } from "../Hooks/useGetProd";
import { ToastContainer, toast } from "react-toastify";
import { ProdList } from "../components";

import "react-toastify/dist/ReactToastify.css";
import "../styles/ProdConteiner.css";

export const ProdContainer = () => {
  const { categoryId } = useParams();

  const [prods, isLoading] = useGetProds(categoryId);

  if (isLoading) return <h1>Loading...</h1>;
  return (
    <div className="conteiner d-flex flex-column justify-content-center h-100 ">
      <h2 className="titulo my-2">
        Welcome to <span className="titulo-color">RealTech</span> !
      </h2>
      <ProdList prods={prods} />
      <ToastContainer />
    </div>
  );
};
