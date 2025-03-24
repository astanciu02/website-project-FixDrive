import os
from bson import ObjectId
from flask import Flask, render_template, jsonify, request
from flask import session, redirect, url_for
from pymongo import MongoClient
import bcrypt
from datetime import datetime

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'default-secret-key')

client = MongoClient("mongodb+srv://reif0207:alexandru@alexandrusappweb.gcar1.mongodb.net/")
db = client['FixDrive']
customers_collection = db['customers']
mechanics_collection = db['mechanics']
appointments_collection = db['appointments']


@app.route('/')
def login():
    return render_template('login.html')


@app.route('/signup')
def signup():
    return render_template('signup.html')


@app.route('/signup', methods=['POST'])
def handle_register():
    data = request.get_json()
    first_name = data.get('firstName')
    last_name = data.get('lastName')
    email = data.get('email')
    phone = data.get('phone')
    city = data.get('city')
    street = data.get('street')
    password = data.get('password')
    checked_option = data.get('checkedOption')

    existing_customer = customers_collection.find_one({"email": email})
    existing_mechanic = mechanics_collection.find_one({"email": email})
    if existing_customer or existing_mechanic:
        return jsonify({"message": "User already exists!"}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    if checked_option == "customer":
        customers_collection.insert_one({
            "firstName": first_name,
            "lastName": last_name,
            "email": email,
            "phone": phone,
            "password": hashed_password
        })
    elif checked_option == "mechanic":
        mechanics_collection.insert_one({
            "firstName": first_name,
            "lastName": last_name,
            "email": email,
            "phone": phone,
            "address": {
                "city": city,
                "street": street
            },
            "services": [],
            "password": hashed_password
        })

    return jsonify({"message": "Registration Successful!"}), 200


@app.route('/login', methods=['POST'])
def handle_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    customer = customers_collection.find_one({"email": email})
    mechanic = mechanics_collection.find_one({"email": email})

    if customer and bcrypt.checkpw(password.encode('utf-8'), customer['password']):
        session['email'] = email
        return jsonify({"message": "Customer!"}), 200
    elif mechanic and bcrypt.checkpw(password.encode('utf-8'), mechanic['password']):
        session['email'] = email
        return jsonify({"message": "Mechanic!"}), 200
    else:
        return jsonify({"message": "Invalid Credentials."}), 401


@app.route('/mechanic-dashboard')
def mechanic_dashboard():
    if 'email' not in session:
        return redirect(url_for('login'))

    email = session['email']
    mechanic = mechanics_collection.find_one({"email": email})
    services = mechanic.get('services', [])

    pipeline_mechanic = [
        {
            "$lookup": {
                "from": "customers",
                "localField": "customerEmail",
                "foreignField": "email",
                "as": "customer"
            }
        },
        {"$unwind": "$customer"},
        {
            "$lookup": {
                "from": "mechanics",
                "localField": "mechanicEmail",
                "foreignField": "email",
                "as": "mechanic"
            }
        },
        {"$unwind": "$mechanic"},
        {
            "$match": {"mechanicEmail": email}
        },
        {
            "$sort": {"date": -1}
        },
        {
            "$project": {
                "date": {
                    "$dateToString": {"format": "%d.%m.%Y", "date": "$date"}
                },
                "time": {
                    "$dateToString": {"format": "%H:%M", "date": "$date"}
                },
                "vehicle": "$vehicle",
                "service": "$service",
                "customerName": {
                    "$concat": ["$customer.firstName", " ", "$customer.lastName"]
                },
                "contact": "$customer.phone",
                "status": "$status"
            }
        }
    ]
    appointments = list(appointments_collection.aggregate(pipeline_mechanic))

    return render_template('mechanic-dashboard.html', services=services, appointments=appointments)


@app.route('/mechanic-dashboard', methods=['POST'])
def update_services():
    if 'email' not in session:
        return redirect(url_for('login'))

    email = session['email']

    data = request.get_json()
    services = data.get('services')

    result = mechanics_collection.update_one(
        {
            "email": email
        },
        {
            "$set": {
                "services": services
            }
        }
    )

    if result.modified_count > 0:
        return jsonify({"message": "Services updated!"}), 200
    else:
        return jsonify({"message": "Something went wrong. Try again later."}), 400


@app.route('/customer-dashboard')
def customer_dashboard():
    if 'email' not in session:
        return redirect(url_for('login'))

    email = session['email']
    pipeline_customer = [
        {
            "$lookup": {
                "from": "customers",
                "localField": "customerEmail",
                "foreignField": "email",
                "as": "customer"
            }
        },
        {"$unwind": "$customer"},
        {
            "$lookup": {
                "from": "mechanics",
                "localField": "mechanicEmail",
                "foreignField": "email",
                "as": "mechanic"
            }
        },
        {"$unwind": "$mechanic"},
        {
            "$match": {"customerEmail": email}
        },
        {
            "$sort": {"date": -1}
        },
        {
            "$project": {
                "date": {
                    "$dateToString": {"format": "%d.%m.%Y", "date": "$date"}
                },
                "time": {
                    "$dateToString": {"format": "%H:%M", "date": "$date"}
                },
                "vehicle": "$vehicle",
                "service": "$service",
                "mechanicName": {
                    "$concat": ["$mechanic.firstName", " ", "$mechanic.lastName"]
                },
                "address": {
                    "$concat": ["$mechanic.address.street", ", ", "$mechanic.address.city"]
                },
                "contact": "$mechanic.phone",
                "status": "$status"
            }
        }
    ]
    appointments = list(appointments_collection.aggregate(pipeline_customer))

    return render_template('customer-dashboard.html', appointments=appointments)


@app.route('/delete-appointment', methods=['POST'])
def delete_appointment():
    if 'email' not in session:
        return redirect(url_for('login'))

    data = request.get_json()

    appointment_ID = data.get('appointmentID')
    result = appointments_collection.delete_one(
        {
            "_id": ObjectId(appointment_ID)
        }
    )

    if result.deleted_count > 0:
        return jsonify({"message": "Appointment cancelled!"}), 200
    else:
        return jsonify({"message": "Failed to cancel appointment."}), 400


@app.route('/complete-appointment', methods=['POST'])
def complete_appointment():
    if 'email' not in session:
        return redirect(url_for('login'))

    data = request.get_json()

    appointment_ID = data.get('appointmentID')
    result = appointments_collection.update_one(
        {
            "_id": ObjectId(appointment_ID)
        },
        {
            "$set":
                {
                    "status": "Completed"
                }
        }
    )

    if result.modified_count > 0:
        return jsonify({"message": "Appointment completed!"}), 200
    else:
        return jsonify({"message": "Failed to complete appointment."}), 400


def search_mechanics(service=None, city=None):
    query = {}

    if service:
        query["services"] = {"$in": [service]}

    if city:
        query["address.city"] = {"$eq": city}

    results = mechanics_collection.find(query)

    return list(results)


@app.route('/search', methods=['GET'])
def search():
    if 'email' not in session:
        return redirect(url_for('login'))

    service = request.args.get('service')
    city = request.args.get('city')

    results = search_mechanics(service, city)

    return render_template('search.html', results=results)


@app.route('/schedule', methods=['GET'])
def schedule():
    if 'email' not in session:
        return redirect(url_for('login'))

    mechanic_ID = request.args.get('mechanicID')
    mechanic = mechanics_collection.find_one({"_id": ObjectId(mechanic_ID)})

    return render_template('schedule.html', mechanic=mechanic)


@app.route('/schedule', methods=['POST'])
def schedule_appointment():
    if 'email' not in session:
        return redirect(url_for('login'))

    data = request.get_json()
    m_email = data.get('mechanicEmail')
    mechanic_email = m_email.strip()
    date_hour = data.get('dateThour')
    formatted_date = datetime.strptime(date_hour, '%Y-%m-%dT%H:%M')
    customer_email = session['email']
    vehicle = data.get('vehicle')
    service = data.get('service')

    result = appointments_collection.insert_one(
        {
            "customerEmail": customer_email,
            "mechanicEmail": mechanic_email,
            "date": formatted_date,
            "vehicle": vehicle,
            "service": service,
            "status": "Ongoing"
        }
    )
    if result.inserted_id:
        return jsonify({"message": "Scheduled Successfully!"}), 200
    else:
        return jsonify({"message": "ERROR."}), 400


@app.route('/logout')
def logout():
    session.pop('email', None)
    return redirect(url_for('login'))


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8888, debug=True)
