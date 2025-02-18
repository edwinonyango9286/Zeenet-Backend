const mongoose = require("mongoose");

const deliveryStationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      unique: true,
      index: true,
      trim: true,
      minlength: [2, "Name must be atleast 2 characters long."],
      maxlength: [72, "Name must be atmost 72 characters long."],
    },
  },
  { timestamps: true }
);

deliveryStationSchema.pre("save", function (next) {
  this.name = this.name.replace(/\b\w/g, (char) => char.toUpperCase());
  next();
});

// Pre-update hook for updating country
deliveryStationSchema.pre("findOneAndUpdate", function (next) {
  if (this._update.name) {
    this._update.name = this._update.name.replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
  }
  next();
});

// Pre-update hook for updating multiple countries
deliveryStationSchema.pre("updateMany", function (next) {
  if (this._update.name) {
    this._update.name = this._update.name.replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
  }
  next();
});

module.exports = mongoose.model("DeliveryStation", deliveryStationSchema);
