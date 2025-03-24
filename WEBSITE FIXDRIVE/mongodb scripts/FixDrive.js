use FixDrive

db.createCollection("customers")
db.createCollection("mechanics")
db.createCollection("appointments")


db.mechanics.insertMany([
    {
        firstName: "Marin",
        lastName: "Rusu",
        email: "rusumarin04@gmail.com",
        phone: "0764918264",
        address: {
            city: "Bucharest",
            street: "Bd Unirii 10"
        },
        services: [ "Engine Repair", "Brake Repair", "Tire Replacement", "Transmission Service", "Battery Replacement", "Cooling System Repair", "Suspension Repair",
                    "Exhaust System Repair", "Air Conditioning/Heating Repair", "Fuel System Service", "Headlight/Taillight Restoration", "Windshield Replacement",
                    "Oil Change", "Wheel Alignment", "Power Steering Repair"],
        password: "test123"
    },
    {
        firstName: "Ion",
        lastName: "Popescu",
        email: "popion@gmail.com",
        phone: "0744928311",
        address: {
            city: "Brasov",
            street: "Str Republicii 15"
        },
        services: [ "Engine Repair", "Brake Repair", "Tire Replacement", "Battery Replacement", "Cooling System Repair", "Suspension Repair",
                    "Exhaust System Repair", "Air Conditioning/Heating Repair", "Windshield Replacement", "Power Steering Repair"],
        password: "test123"
    },
    {
        firstName: "Robert",
        lastName: "Dragomir",
        email: "rd@hotmail.com",
        phone: "0790723875",
        address: {
            city: "Cluj",
            street: "Str Avram Iancu 25"
        },
        services: [ "Engine Repair", "Brake Repair", "Tire Replacement", "Transmission Service", "Battery Replacement", "Cooling System Repair", "Suspension Repair",
                    "Exhaust System Repair", "Air Conditioning/Heating Repair", "Fuel System Service", "Headlight/Taillight Restoration", "Windshield Replacement",
                    "Oil Change", "Wheel Alignment", "Power Steering Repair"],
        password: "test123"
    },
    {
        firstName: "Andrei",
        lastName: "Popescu",
        email: "popa@gmail.com",
        phone: "0790813820",
        address: {
            city: "Bucuresti",
            street: "Calea Victoriei 45"
        },
        services: [ "Engine Repair", "Brake Repair", "Tire Replacement", "Battery Replacement", "Cooling System Repair", "Suspension Repair",
                    "Exhaust System Repair", "Air Conditioning/Heating Repair", "Windshield Replacement", "Power Steering Repair"],
        password: "test123"
    }
])


db.mechanics.updateOne(
    {
        email: "M"
    },
    {
        $set: {
        services: [ "Exhaust System Repair", "Air Conditioning/Heating Repair" ]
        }
    }
)

db.mechanics.updateOne(
    {
        email: "M"
    },
    {
        $set: {
        services: []
        }
    }
)


db.appointments.insertOne(
    {
        customerEmail: "C",
        mechanicEmail: "rdd@hotmail.com",
        date: new Date("2024-12-17T10:30"),
        vehicle: "Toyota RAV4",
        service: "Exhaust System Repair",
        status: "Ongoing"
    }
)

db.appointments.insertMany([
    {
        customerEmail: "C",
        mechanicEmail: "M",
        date: new Date("2024-12-17T10:30"),
        vehicle: "Toyota RAV4",
        service: "Exhaust System Repair",
        status: "Completed  "
    },
    {
        customerEmail: "C",
        mechanicEmail: "M",
        date: new Date("2024-12-17T13:30"),
        vehicle: "Volvo XC60",
        service: "Wheel Alignment",
        status: "Ongoing"
    }
])


// pentru mechanic display
// Date
// Time
// Vehicle
// Service
// Customer
// Contact
db.appointments.aggregate([
  {
    $lookup: {
      from: "customers",
      localField: "customerEmail",
      foreignField: "email",
      as: "customer"
    }
  },
  { $unwind: "$customer" },
  {
    $lookup: {
      from: "mechanics",
      localField: "mechanicEmail",
      foreignField: "email",
      as: "mechanic"
    }
  },
  { $unwind: "$mechanic" },
  {
    $match: { "mechanicEmail": "M" }
  },
  {
    $project: {
        date: {
        $dateToString: { format: "%Y-%m-%d", date: "$date" }
        },
        time: {
        $dateToString: { format: "%H:%M", date: "$date" }
        },
        vehicle: "$vehicle",
        service: "$service",
        customerName: {
            $concat: ["$customer.firstName", " ", "$customer.lastName"]
        },
        contact: "$customer.phone",
        status: "$status"
    }
  }
])

// pentru customer display
// Date
// Time
// Vehicle
// Service
// Address: street, city
// Contact
db.appointments.aggregate([
  {
    $lookup: {
      from: "customers",
      localField: "customerEmail",
      foreignField: "email",
      as: "customer"
    }
  },
  { $unwind: "$customer" },
  {
    $lookup: {
      from: "mechanics",
      localField: "mechanicEmail",
      foreignField: "email",
      as: "mechanic"
    }
  },
  { $unwind: "$mechanic" },
  {
    $match: { "customerEmail": "C" }
  },
  {
    $project: {
        date: {
        $dateToString: { format: "%Y-%m-%d", date: "$date" }
        },
        time: {
        $dateToString: { format: "%H:%M", date: "$date" }
        },
        vehicle: "$vehicle",
        service: "$service",
        mechanicName: {
            $concat: ["$mechanic.firstName", " ", "$mechanic.lastName"]
        },
        address: {
            $concat: ["$mechanic.address.street", ", ", "$mechanic.address.city"]
        },
        contact: "$mechanic.phone",
        status: "$status"
    }
  }
])

// cancel appointment
// COD IN APP.PY

// complete appointment
// COD IN APP.PY

// search based on filter
db.mechanics.find(
    {
            services: { $in: ["Exhaust System Repair"] },
            "address.city": { $eq: "Iasi" }
    }
)
db.mechanics.deleteOne({
    email: "alex.a630@yahoo.com"
})

db.customers.deleteOne({
    email: "alexandru1969@yahoo.com"
})

db.mechanics.deleteOne({
    email: "alexandrus413@gmail.com"
})