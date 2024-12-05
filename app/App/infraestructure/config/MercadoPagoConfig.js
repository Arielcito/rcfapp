export default handleIntegrationMP = async (pitch) => {
  const ACCESS_TOKEN = "APP_USR-1146854699413294-082512-ac3513bee5302591ed18bbd879b0c8c4-1940745168";
  const { place } = pitch;
  const image = require("../../presentation/assets/images/RCF.png");
  const preferencia = {
    items: [
      {
        title: place.name,
        description: `RCF App`,
        picture_url: "https://www.megafutbol.com.ar/fotos/foto119.jpg",
        category_id: "cells",
        quantity: 1,
        currency_id: "$",
        unit_price: 20000,
      },
    ],
  };

  try {
    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferencia),
      }
    );

    const data = await response.json();

    return data.init_point;
  } catch (error) {
    console.log(error);
  }
};
