const client = require("./client");
const { getProductById } = require("./products");

async function createOrder({
  userId,
  productId,
  count,
  orderStatus,
  orderCreated
}) {
  try {
    const {
      rows: [order],
    } = await client.query(
      `
            INSERT into orders("userId", "productId", count, "orderStatus", "orderCreated")
            VALUES($1, $2, $3, $4, $5)
            RETURNING *;
        `,
      [userId, productId, count, orderStatus, orderCreated]
    );
    return order;
  } catch (error) {
    throw error;
  }
}

async function deleteProductFromOrder(id) {
  try {
    const { rows } = await client.query(
      `
            DELETE FROM orders
            WHERE "productId"=$1
            RETURNING *;
        `,
      [id]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function deleteOrder(id) {
  try {
    // await client.query(
    //   `
    //         DELETE FROM orders
    //         WHERE "productId"=$1;
    //     `,
    //   [id]
    // );

    const { rows } = await client.query(
      `
            DELETE FROM orders
            WHERE id=$1
            RETURNING *;
        `,
      [id]
    );

    return rows;
  } catch (error) {
    throw error;
  }
}

// async function updateOrder ({ id, title, price, count }) {
//     const {rows: [order] } = await client.query(`
//         UPDATE orders
//         SET title=$2, price=$3, count=$4
//         WHERE id=$1
//         RETURNING *;
//     `, [id, title, price, count])
//     return order
// }

//need to figure out how to address userId and guest checkout
//figure out how to make orders into an array
async function addProductToOrder({
  userId,
  productId,
  count,
  orderStatus,
  orderCreated
}) {
  console.log(productId, "line 64");
  const product = await getProductById(productId);
  console.log(product, "line 65");
  try {
    const {
      rows: [order],
    } = await client.query(
      `
            INSERT INTO orders( "userId", "productId", count, "orderStatus", "orderCreated")
            VALUES($1, $2, $3, $4, $5)
            RETURNING *;
        `,
      [userId, productId, count, orderStatus, orderCreated]
    );

    // console.log(order.products, "line 76")
    // order.products.push(product)

    return order;
  } catch (error) {
    throw error;
  }
}

async function getOrderById(id) {
  try {
    const {
      rows: [order],
    } = await client.query(
      `
            SELECT * 
            FROM orders 
            WHERE id=$1;
        `,
      [id]
    );
    return order;
  } catch (error) {
    throw error;
  }
}

async function getAllOrders() {
  try {
    const { rows } = await client.query(`
    SELECT orders.*, products.price AS "productPrice", products."imageURL", products.title AS "productTitle", users.username AS "creatorName", users.email AS "creatorEmail" 
    FROM orders 
    INNER JOIN products ON products.id = orders."productId"
    INNER JOIN users ON users.id = orders."userId";
      `);
    console.log(rows);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getOrderForUser(userId) {
  try {
    const { rows } = await client.query(
      `
      SELECT orders.*, products.price AS "productPrice", products."imageURL",  products.title AS "productTitle"
      FROM orders 
      JOIN products ON products.id = orders."productId"
      WHERE orders."userId"= $1 AND (orders."orderStatus" = 'created' OR orders."orderStatus" = 'pending');
        `,
      [userId]
    );

    console.log(rows);
    return rows;
  } catch (error) {
    throw error;
  }
}

// async function getOrderForUser(userId) {
//     try {
//         const {rows: [order]} = await client.query(`
//         SELECT *
//         FROM orders
//         WHERE "userId"=$1 AND "orderStatus"=false;
//         `, [userId])
//         return order;
//     } catch (error) {
//         throw error
//     }
// }

async function updateOrder({ id, userId, productId, count, orderStatus, orderCreated }) {
  const fields = {
    userId: userId,
    productId: productId,
    count: count,
    orderStatus: orderStatus,
    orderCreated: orderCreated
  };

  if (userId === undefined || userId === null) delete fields.userId;
  if (productId === undefined || productId === null) delete fields.productId;
  if (count === undefined || count === null) delete fields.count;
  if (orderStatus === undefined || orderStatus === null) delete fields.orderStatus;
  if (orderCreated === undefined || orderStatus === null) delete fields.orderCreated;
  

  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  // return early if this is called without fields
  if (setString.length === 0) {
    return;
  }

  try {
    const {
      rows: [orders],
    } = await client.query(
      `
      UPDATE orders
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
      `,
      Object.values(fields)
    );
    
    return orders;
  } catch (error) {
    throw error;
  }
}

// async function increaseCountOfProduct(productTitle) {
//   try {
//     const {
//       rows: [product],
//     } = await client.query(
//       `
//             SELECT *
//             FROM orders 
//             WHERE "productTitle"=$1;
//         `,
//       [productTitle]
//     );

//     const newCount = product.count + 1;

//     const {
//       rows: [order],
//     } = await client.query(
//       `
//             UPDATE orders 
//             SET count= $2
//             WHERE "productTitle"=$1
//             RETURNING*;
//         `,
//       [productTitle, newCount]
//     );

//     return order;
//   } catch (error) {
//     throw error;
//   }
// }

async function increaseCountOfProduct(orderId) {
  
  try {
    const {rows: [count ]} = await client.query(`
      UPDATE orders 
      SET count = ${count} + 1
      WHERE id =${orderId}
    `)
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createOrder,
  deleteProductFromOrder,
  deleteOrder,
  updateOrder,
  addProductToOrder,
  getOrderById,
  getAllOrders,
  getOrderForUser,
  // increaseCountOfProduct,
};
