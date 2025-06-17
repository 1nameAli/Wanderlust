const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner, validateListings } = require("../middleware");
const listingController = require("../controllers/listings");
const multer = require("multer");
const { storage } = require("../cloudConfig");
const Listing = require("../models/Listing");
const upload = multer({ storage });

// GET all listings (with optional category filter) + POST new listing
router.route("/")
  .get(wrapAsync(async (req, res) => {
    const { category } = req.query;
    let filter = {};
    if (category) {
      filter.category = category;
    }

    try {
      const allListings = await Listing.find(filter);
      res.render("listing/index", { allListings, selectedCategory: category || null });
    } catch (err) {
      res.status(500).send("Error loading listings: " + err.message);
    }
  }))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    wrapAsync(listingController.createListing)
  );

// Search route
router.get("/search", async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.redirect("/listings");
  }

  const regex = new RegExp(query, "i");

  try {
    const allListings = await Listing.find({
      $or: [
        { title: regex },
        { description: regex },
        { location: regex }
      ],
    });

    res.render("listing/index", { allListings, selectedCategory: null });
  } catch (err) {
    res.status(500).send("Error while searching: " + err.message);
  }
});

// New Listing Form
router.get("/new", isLoggedIn, listingController.newListingForm);

// Show, Update, Delete a single listing
router.route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isOwner,
    upload.single("listing[image]"),
    validateListings,
    wrapAsync(listingController.updateListing)
  )
  .delete(isOwner, wrapAsync(listingController.deleteListing));

// Edit form
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListingForm));

module.exports = router;
