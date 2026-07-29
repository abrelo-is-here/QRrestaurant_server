import Rate from "../models/Currency.js";

// CREATE RATE
export const createRate = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { rate } = req.body;

    const existingRate = await Rate.findOne({ restaurantId });

    if (existingRate) {
      return res.status(400).json({
        message: "Rate already exists for this restaurant",
      });
    }

    const newRate = await Rate.create({
      restaurantId,
      rate,
    });

    res.status(201).json({
      message: "Rate created successfully",
      rate: newRate,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET RATE
export const getRate = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const rate = await Rate.findOne({ restaurantId });

    if (!rate) {
      return res.status(404).json({
        message: "Rate not found for this restaurant",
      });
    }

    res.status(200).json(rate);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// UPDATE RATE

export const updateRate = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { rate } = req.body;

    const existingRate = await Rate.findOne({
      restaurantId,
    });

    if (!existingRate) {
      return res.status(404).json({
        message: "Rate not found for this restaurant",
      });
    }

    existingRate.rate = rate;

    await existingRate.save();

    res.status(200).json({
      message: "Rate updated successfully",
      rate: existingRate,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};