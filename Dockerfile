FROM php:5.6-apache
COPY docker/run.sh /run.sh
RUN chmod +x /run.sh
CMD /run.sh
