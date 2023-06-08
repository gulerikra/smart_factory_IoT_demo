import cv2
import numpy as np
import urllib.request
import cv2
from ultralytics import YOLO # YOLOv8 modeli için ultralytics kütüphanesini kullanıyoruz
import datetime

#YOLOv8 modelinin çağrılması
model = YOLO("last.pt")

# IP adresi ile video akışı bağlantısı
url = 'http://192.168.43.151/'

# Video akışı için sonsuz bir döngü
while True:
# Video akışı alma
    img_resp = urllib.request.urlopen(url + 'cam-hi.jpg')
    imgnp = np.array(bytearray(img_resp.read()), dtype=np.uint8)
    kamera = cv2.imdecode(imgnp, -1)
    # Nesne tespiti işlemini gerçekleştirmek için görüntüyü model kullanarak işleme sokuyoruz
    de_out=model.predict(source=kamera, conf=0.1, show=True, device='cpu')

    # Nesne tespiti sonucunda en az bir nesne tespit edilmişse
    if len(de_out) != 0:
        isCompress = 0
        img_copy = kamera.copy() 

        # Tüm tespit edilen nesneler için
        for i in range(len(de_out[0])):
            boxes = de_out[0].boxes
            box = boxes[i]
            clsID = boxes.cls.numpy()[0]
            conf = box.conf.numpy()[0]
            bb = box.xyxy.numpy()[0]
            print(datetime.datetime.now()) # Tespit anını yazdır
            print(clsID) # Tespit edilen nesnenin sınıfını yazdır
            
            if clsID == 0:
                cv2.rectangle(img_copy, (int(bb[0]), int(bb[1])), (int(bb[2]), int(bb[3])), (0, 255, 0), 2)
                cv2.imwrite('public/image.jpg', img_copy) # Görüntüyü kaydet

