while getopts  a:n:w:e:p:r:i:y:t:u:s:c:z: flag

do 
	case "${flag}" in 
        a) APP_NAME=${OPTARG};;
        n) APP_ID=${OPTARG};;
        w) VERSION=${OPTARG};;
        e) APP_IMAGE=${OPTARG};;
        p) APP_DESCRIPTION=${OPTARG};;
        y) COMPOSE_PATH=${OPTARG};;
        r) APP_REPOSITORY=${OPTARG};;
        i) APP_ICON=${OPTARG};;
        t) REDIRECT_TYPE=${OPTARG};;
        u) REDIRECT_URL=${OPTARG};;
        s) REDIRECT_SECTION=${OPTARG};;
        c) LOG=${OPTARG};;
        z) REST_URL=${OPTARG};;
		#f) FLOW_PATH=${OPTARG};;
		esac
done

echo "APP-Name:$APP_NAME";
echo "APP-ID:$APP_ID";
echo "VERSION:$VERSION";
echo "APP_IMAGE:$APP_IMAGE";
echo "APP_DESCRIPTION:$APP_DESCRIPTION";
echo "COMPOSE-PATH:$COMPOSE_PATH";
echo "APP_REPOSITORY:$APP_REPOSITORY";
echo "APP_ICON:$APP_ICON";
echo "REDIRECT_TYPE:$REDIRECT_TYPE";
echo "REDIRECT_URL:$REDIRECT_URL";
echo "APP_ICON:$REDIRECT_SECTION";
echo "REDIRECT_TYPE:$LOG";
echo "REDIRECT_URL:$REST_URL";

CONTAINER_PATH_NO_WHITESPACE="$(echo ${APP_ID} | tr -d '[:space:]')"
cd ./artifacts/containerWorkspace/containerCollection/"$CONTAINER_PATH_NO_WHITESPACE"
docker compose build --build-arg FPATH=./containerCollection/"$CONTAINER_PATH_NO_WHITESPACE"/volume/flows.json

docker compose create

docker compose start

echo "**********************INIT WORKSPACE*****************************"
mkdir -p workspace 
iectl config add publisher --name "publisherdev"  --workspace workspace -u http://host.docker.internal:2375 #http://localhost:2375

iectl publisher workspace init
# IECTL environmental variables
export IE_SKIP_CERTIFICATE=true
export EDGE_SKIP_TLS=1

echo "-----------------------------------------Create .app file------------------------------------------------"
iectl publisher sa cae -a $APP_NAME --appid $APP_ID -w $VERSION -e $APP_IMAGE -p $APP_DESCRIPTION -r $APP_REPOSITORY -i $APP_ICON -y $COMPOSE_PATH -t $REDIRECT_TYPE -u $REDIRECT_URL -s $REDIRECT_SECTION -c $LOG -z '' -v

docker kill $APP_NAME
docker rm $APP_NAME
