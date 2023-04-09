import cv2
import numpy as np
import urllib.request
import mediapipe as mp
import cv2
from ultralytics import YOLO
import datetime

model = YOLO("last.pt")

url = 'http://192.168.43.151/'
#cv2.namedWindow("live transmission", cv2.WINDOW_AUTOSIZE)

while True:
    img_resp = urllib.request.urlopen(url + 'cam-hi.jpg')
    imgnp = np.array(bytearray(img_resp.read()), dtype=np.uint8)
    kamera = cv2.imdecode(imgnp, -1)
    
    de_out=model.predict(source=kamera, conf=0.2, show=True, device='cpu')

    if len(de_out) != 0:
        isCompress = 0
        for i in range(len(de_out[0])):
            boxes = de_out[0].boxes
            box = boxes[i]
            clsID =boxes.cls.numpy()[0]
            conf = box.conf.numpy()[0]
            bb = box.xyxy.numpy()[0]
            print(datetime.datetime.now())
            print(clsID)
            if clsID==0:
                cv2.imwrite('public/image.jpg', kamera)
