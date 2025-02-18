const BlogCategory = require("../models/blogCategoryModel");
const expressAsyncHandler = require("express-async-handler");
const validateMongodbId = require("../utils/validateMongodbId");
const redis = require("../utils/redis");

const createABlogCategory = expressAsyncHandler(async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      throw new Error("Please provide all the required fields");
    }
    const createdBlogCategory = await BlogCategory.create(req.body);
    res.status(201).json(createdBlogCategory);
  } catch (error) {
    throw new Error(error);
  }
});

// When updating consider  data in the redis
const updateABlogCategory = expressAsyncHandler(async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      throw new Error("Please provide all the required fields");
    }
    const { id } = req.params;
    validateMongodbId(id);
    const updatedBlogCategory = await BlogCategory.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    );
    if (!updatedBlogCategory) {
      throw new Error("Blog category not found.");
    }
    res.status(200).json(updatedBlogCategory);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteABlogCategory = expressAsyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);
    const deletedBlogCategory = await BlogCategory.findByIdAndDelete(id);
    if (!deletedBlogCategory) {
      throw new Error("Blog category not found.");
    }
    res.status(200).json(deletedBlogCategory);
  } catch (error) {
    throw new Error(error);
  }
});

const getABlogCategory = expressAsyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongodbId(id);
    const cacheKey = `blogCategory:${id}`;
    const cachedBlogCategory = await redis.get(cacheKey);
    if (cachedBlogCategory) {
      return res.status(200).json(JSON.parse(cachedBlogCategory));
    }
    const blogCategory = await BlogCategory.findById(id);
    if (!blogCategory) {
      throw new error("Blog category not found.");
    }
    await redis.set(cacheKey, JSON.stringify(blogCategory), "EX", 2);
    res.status(200).json(blogCategory);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllBlogCategories = expressAsyncHandler(async (req, res) => {
  try {
    const queryObject = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "offset", "fields"];
    excludeFields.forEach((el) => delete queryObject[el]);

    queryObject.isDeleted = false;
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = BlogCategory.find(JSON.parse(queryStr));


    // sorting 
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }


    // field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }




    const cacheKey = `blogCategories`;
    const cachedBlogCategories = await redis.get(cacheKey);
    if (cachedBlogCategories) {
      return res.status(200).json(JSON.parse(cachedBlogCategories));
    }
    const blogCategories = await BlogCategory.find();
    await redis.set(cacheKey, JSON.stringify(blogCategories), "EX", 2);
    res.status(200).json(blogCategories);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createABlogCategory,
  updateABlogCategory,
  deleteABlogCategory,
  getABlogCategory,
  getAllBlogCategories,
};
