import sys
from PIL import Image
# python scripts/stillsheet.py <comp> <sec,sec,...> <cols> <width> <out>
comp,secs,cols,w,out=sys.argv[1],sys.argv[2].split(','),int(sys.argv[3]),int(sys.argv[4]),sys.argv[5]
ims=[]
for s in secs:
    im=Image.open(f"out/stills/{comp}-{float(s):.2f}s.jpg"); r=w/im.width; ims.append(im.resize((w,int(im.height*r))))
h=ims[0].height; rows=(len(ims)+cols-1)//cols
sh=Image.new('RGB',(cols*w,rows*h),(20,20,20))
for i,im in enumerate(ims): sh.paste(im,((i%cols)*w,(i//cols)*h))
sh.save(out); print(len(ims), sh.size)
