from flask import Flask, request, jsonify
from keras.models import model_from_json
import cv2
import numpy as np
import os
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
maindir = os.path.dirname(__file__)
modelJsonFile = os.path.join(maindir, "models", "model.json")
modelWeightsFile = os.path.join(maindir, "models", "model15.h5")

headPoseJsonFile = os.path.join(maindir, "models", "head_pose_model.json")
headPoseWeightsFile = os.path.join(maindir, "models", "head_pose_model_weights.h5")

# Load the model
with open(modelJsonFile, "r") as file:
    model_json = file.read()
    model = model_from_json(model_json)
    model.load_weights(modelWeightsFile)

with open(headPoseJsonFile, "r") as file:
    model_json = file.read()
    headPoseModel = model_from_json(model_json)
    headPoseModel.load_weights(headPoseWeightsFile)

@app.route("/", methods=["POST"])
def predict():
    imagefile = request.files['imagefile']
    image_path = os.path.join(maindir, "images", imagefile.filename)
    imagefile.save(image_path)
    img = transformImg(image_path)
    label = model.predict(img)
    prediction = process_prediction(label)
    return jsonify(prediction=prediction)

def transformImg(image_path):
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    img = cv2.resize(img, (48, 48))
    img = np.reshape(img, [1, 48, 48, 1])
    return img

def process_prediction(prediction):
    # Process prediction result here
    # Example: return a label or class name
    return "Prediction: {}".format(prediction)


# [
#     {
#         "landmarks": [
#             {
#                 "x": 347.07054138183594,
#                 "y": 335.59301376342773
#             },
#             {
#                 "x": 345.7489776611328,
#                 "y": 395.0357437133789
#             },
#             {
#                 "x": 387.9454803466797,
#                 "y": 307.4226379394531
#             },
#             {
#                 "x": 305.34521102905273,
#                 "y": 304.9394702911377
#             },
#             {
#                 "x": 369.09542083740234,
#                 "y": 368.22489738464355
#             },
#             {
#                 "x": 323.4907913208008,
#                 "y": 367.0866107940674
#             }
#         ]
#     }
# ]

@app.route("/angles", methods=["POST"])
def angles():
    data = request.json
    coords=[]
    for ele in data[0]['landmarks']:
        coords.extend([ele['x'],ele['y']])
    np_coords = np.array(coords)
    np_coords = np_coords.reshape(1, 12, )
    head_poseLabel = headPoseModel.predict(np_coords, verbose=0)
    degX, degY, degZ, tx, ty, tz = head_poseLabel[0]
    return jsonify({"degX": int(degX), "degY": int(degY), "degZ": int(degZ), "tx": int(tx), "ty": int(ty), "tz": int(tz)})


if __name__ == '__main__':
    app.run(port=3000, debug=True)
