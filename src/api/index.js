import express from "express";
import pkg from "@prisma/client";
import morgan from "morgan";
import cors from "cors";
import fetch from "node-fetch";
import jwt from "express-jwt";
import jwks from "jwks-rsa";

import { RapidAPI_HOST, RapidAPI_KEY } from "./secret.js";

var requireAuth = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: process.env.AUTH0_JWK_URI,
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: process.env.AUTH0_ISSUER,
  algorithms: ["RS256"],
});

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const options = {
  method: "GET",
  headers: {
    "X-RapidAPI-Host": RapidAPI_HOST,
    "X-RapidAPI-Key": RapidAPI_KEY,
  },
};

app.get("/user/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
      include: {
        wishlist: {
          include: {
            product: true,
          },
        },
        review: true,
      },
    });
    if (user === null) {
      res.status(404).json(null);
    } else {
      res.json(user);
    }
  } catch (e) {
    res.status(503).json(null);
  }
});

app.get("/searchRecipe/:keyword", async (req, res) => {
  const keyword = req.params.keyword;
  const url =
    "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/search?query=" +
    keyword +
    "&number=100";
  try {
    const response = await fetch(url, options).then((res) => {
      if (!res.ok) {
        throw new Error(res.status.toString());
      }
      return res.json();
    });
    res.json(response);
  } catch (error) {
    res.status(parseInt(error.message)).json(null);
  }
});

app.get("/getRecipeInfo/:id", async (req, res) => {
  const id = req.params.id;
  const url =
    "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/" +
    id +
    "/information";
  try {
    const response = await fetch(url, options).then((res) => {
      if (!res.ok) {
        throw new Error(res.status.toString());
      }
      return res.json();
    });
    res.json(response);
  } catch (error) {
    res.status(parseInt(error.message)).json(null);
  }
});

app.get("/getRandomRecipe", async (req, res) => {
  const url =
    "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/random?number=1";
  try {
    const response = await fetch(url, options).then((res) => {
      if (!res.ok) {
        throw new Error(res.status.toString());
      }
      return res.json();
    });
    res.json(response);
  } catch (error) {
    res.status(parseInt(error.message)).json(null);
  }
});

// user section
app.get("/me", requireAuth, async (req, res) => {
  const auth0Id = req.user.sub;
  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
    include: {
      wishlist: {
        include: {
          product: true,
        },
      },
      review: {
        include: {
          product: true,
        },
      },
    },
  });

  res.json(user);
});

// verify user status, if not registered in our database we will create it
app.post("/verify-user", requireAuth, async (req, res) => {
  const auth0Id = req.user.sub;
  const email = req.user[`${process.env.AUTH0_AUDIENCE}/email`];
  const name = req.user[`${process.env.AUTH0_AUDIENCE}/name`];

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  if (user) {
    res.json(user);
  } else {
    const newUser = await prisma.user.create({
      data: {
        email,
        auth0Id,
        name,
      },
    });

    res.json(newUser);
  }
});

app.post("/me", requireAuth, async (req, res) => {
  const auth0Id = req.user.sub;
  const newName = req.body.newName;

  const user = await prisma.user.update({
    where: {
      auth0Id: auth0Id,
    },
    data: {
      name: newName,
    },
  });
  res.json(user);
});

app.post("/recipe", async (req, res) => {
  const { externalId, productName, imageURL } = req.body;
  try {
    const recipe = await prisma.product.create({
      data: {
        externalId: externalId,
        productName: productName,
        imageURL: imageURL,
      },
    });
    res.json(recipe);
  } catch (e) {
    res.status(422).json(null);
  }
});

app.get("/recipe/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const recipe = await prisma.product.findUnique({
      where: {
        externalId: id,
      },
      include: {
        review: {
          include: {
            user: true,
          }
        },
      },
    });
    if (recipe === null) {
      res.status(404).json(null);
    } else {
      res.json(recipe);
    }
  } catch (e) {
    res.status(503).json(null);
  }
});

app.get("/communityPicks", async (req, res) => {
  try {
    const recipes = await prisma.product.findMany({
      include: {
        review: true,
      },
    });
    recipes.sort((a, b) => -(a.review.length - b.review.length));
    if (recipes.length > 8) {
      res.json(recipes.slice(0, 8));
    }
    else {
      res.json(recipes);
    }
  } catch (e) {
    res.status(503).json(null);
  }
});

app.post("/wishlist", requireAuth, async (req, res) => {
  const auth0Id = req.user.sub;
  const { title } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: {
        auth0Id,
      },
    });
    const wishlist = await prisma.wishlist.create({
      data: {
        title: title,
        user: { connect: { id: user.id } },
      },
    });
    res.json(wishlist);
  } catch (e) {
    res.status(422).json(null);
  }
});

app.post("/wishlist/:productId", requireAuth, async (req, res) => {
  const auth0Id = req.user.sub;
  const productId = parseInt(req.params.productId);
  const { title } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: {
        auth0Id,
      },
    });
    const product = await prisma.product.findUnique({
      where: {
        externalId: productId,
      },
    });
    if (product === null) {
      throw new Error("404 not found!");
    }
    const wishlist = await prisma.wishlist.create({
      data: {
        title: title,
        imageURL: product.imageURL,
        product: { connect: { externalId: productId } },
        user: { connect: { id: user.id } },
      },
    });
    res.json(wishlist);
  } catch (e) {
    res.status(422).json(null);
  }
});

app.get("/wishlist/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const auth0Id = req.user.sub;
  try {
    const user = await prisma.user.findUnique({
      where: {
        auth0Id,
      },
      include: {
        wishlist: true,
      },
    });
    let found = false;
    for (let i = 0; i < user.wishlist.length; i++) {
      if (user.wishlist[i].id === id) {
        found = true;
        break;
      }
    }
    if (!found) {
      res.status(401).json(null);
    } else {
      const wishlist = await prisma.wishlist.findUnique({
        where: {
          id: id,
        },
        include: {
          product: true,
        },
      });
      if (wishlist === null) {
        res.status(404).json(null);
      } else {
        res.json(wishlist);
      }
    }
  } catch (e) {
    res.status(503).json(null);
  }
});

app.put("/wishlist/:id", requireAuth, async (req, res) => {
  const { title } = req.body;
  const auth0Id = req.user.sub;
  const id = parseInt(req.params.id);
  try {
    const user = await prisma.user.findUnique({
      where: {
        auth0Id,
      },
      include: {
        wishlist: true,
      },
    });
    let found = false;
    for (let i = 0; i < user.wishlist.length; i++) {
      if (user.wishlist[i].id === id) {
        found = true;
        break;
      }
    }
    if (!found) {
      res.status(401).json(null);
    } else {
      const wishlist = await prisma.wishlist.update({
        where: {
          id: id,
        },
        data: {
          title: title,
        },
      });
      res.json(wishlist);
    }
  } catch (e) {
    res.status(422).json(null);
  }
});

app.put("/wishlist/:id/add_:productId", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const auth0Id = req.user.sub;
  const productId = parseInt(req.params.productId);
  try {
    const user = await prisma.user.findUnique({
      where: {
        auth0Id,
      },
      include: {
        wishlist: true,
      },
    });
    let found = false;
    for (let i = 0; i < user.wishlist.length; i++) {
      if (user.wishlist[i].id === id) {
        found = true;
        break;
      }
    }
    if (!found) {
      res.status(401).json(null);
    } else {
      const wishlist = await prisma.wishlist.findUnique({
        where: {
          id: id,
        },
        include: {
          product: true,
        },
      });
      if (wishlist === null) {
        throw new Error("404 Not Found");
      }
      if (wishlist.product.length === 0) {
        const recipe = await prisma.product.findUnique({
          where: {
            externalId: productId,
          },
        });
        if (recipe === null) {
          throw new Error("404 Not Found");
        }
        const updatedWishlist = await prisma.wishlist.update({
          where: {
            id: id,
          },
          data: {
            imageURL: recipe.imageURL,
            product: {
              connect: [{ externalId: productId }],
            },
          },
        });
        res.json(updatedWishlist);
      } else {
        const updatedWishlist = await prisma.wishlist.update({
          where: {
            id: id,
          },
          data: {
            product: {
              connect: [{ externalId: productId }],
            },
          },
        });
        res.json(updatedWishlist);
      }
    }
  } catch (e) {
    res.status(422).json(null);
  }
});

app.put("/wishlist/:id/delete_:productId", requireAuth, async (req, res) => {
  const auth0Id = req.user.sub;
  const id = parseInt(req.params.id);
  const productId = parseInt(req.params.productId);
  try {
    const user = await prisma.user.findUnique({
      where: {
        auth0Id,
      },
      include: {
        wishlist: true,
      },
    });
    let found = false;
    for (let i = 0; i < user.wishlist.length; i++) {
      if (user.wishlist[i].id === id) {
        found = true;
        break;
      }
    }
    if (!found) {
      res.status(401).json(null);
    } else {
      const wishlist = await prisma.wishlist.update({
        where: {
          id: id,
        },
        data: {
          product: {
            disconnect: [{ externalId: productId }],
          },
        },
        include: {
          product: true,
        },
      });
      const newURL =
        wishlist.product.length === 0
          ? "/empty-basket.png"
          : wishlist.product[0].imageURL;
      const updatedWishlist = await prisma.wishlist.update({
        where: {
          id: id,
        },
        data: {
          imageURL: newURL,
        },
      });
      res.json(updatedWishlist);
    }
  } catch (e) {
    res.status(422).json(null);
  }
});

app.delete("/wishlist/:id", requireAuth, async (req, res) => {
  const auth0Id = req.user.sub;
  const id = parseInt(req.params.id);
  try {
    const user = await prisma.user.findUnique({
      where: {
        auth0Id,
      },
      include: {
        wishlist: true,
      },
    });
    let found = false;
    for (let i = 0; i < user.wishlist.length; i++) {
      if (user.wishlist[i].id === id) {
        found = true;
        break;
      }
    }
    if (!found) {
      res.status(401).json(null);
    } else {
      const wishlist = await prisma.wishlist.delete({
        where: {
          id: id,
        },
      });
      res.json(wishlist);
    }
  } catch (e) {
    res.status(422).json(null);
  }
});

app.post("/review", requireAuth, async (req, res) => {
  const auth0Id = req.user.sub;
  const { productId, content, rating } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: {
        auth0Id,
      },
    });
    const review = await prisma.review.create({
      data: {
        product: { connect: { externalId: productId } },
        user: { connect: { id: user.id } },
        content: content,
        rating: rating,
      },
    });
    res.json(review);
  } catch (e) {
    res.status(422).json(null);
  }
});

app.put("/review/:id", requireAuth, async (req, res) => {
  const auth0Id = req.user.sub;
  const { content, rating } = req.body;
  const id = parseInt(req.params.id);
  try {
    const user = await prisma.user.findUnique({
      where: {
        auth0Id,
      },
      include: {
        review: true,
      },
    });
    let found = false;
    for (let i = 0; i < user.review.length; i++) {
      if (user.review[i].id === id) {
        found = true;
        break;
      }
    }
    if (!found) {
      res.status(401).json(null);
    } else {
      const review = await prisma.review.update({
        where: {
          id: id,
        },
        data: {
          content: content,
          rating: rating,
        },
      });
      res.json(review);
    }
  } catch (e) {
    res.status(422).json(null);
  }
});

app.delete("/review/:id", requireAuth, async (req, res) => {
  const auth0Id = req.user.sub;
  const id = parseInt(req.params.id);
  try {
    const user = await prisma.user.findUnique({
      where: {
        auth0Id,
      },
      include: {
        review: true,
      },
    });
    let found = false;
    for (let i = 0; i < user.review.length; i++) {
      if (user.review[i].id === id) {
        found = true;
        break;
      }
    }
    if (!found) {
      res.status(401).json(null);
    } else {
      const review = await prisma.review.delete({
        where: {
          id: id,
        },
      });
      res.json(review);
    }
  } catch (e) {
    res.status(422).json(null);
  }
});

app.post("/home", async (req, res) => {});
const PORT = parseInt(process.env.PORT) || 8000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} 🎉 🚀`);
});
