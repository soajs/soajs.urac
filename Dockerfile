FROM soajsorg/node-slim

RUN mkdir -p /opt/soajs/soajs.urac/node_modules/
WORKDIR /opt/soajs/soajs.urac/
COPY . .
RUN npm install

CMD ["/bin/bash"]