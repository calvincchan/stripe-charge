#
# Create a Lambda layer that inludes all dependencies in node_modules/ dir.
# https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html#configuration-layers-path
#
layername="stripe-charge-dependencies"
runtime="nodejs16.x"
arch="arm64"
TIMESTAMP=`date +"%Y%m%d-%H%M%S"`
echo "================================="

echo "LayerName: $layername"
echo "Runtime: $runtime"
echo "Architecture: $arch"

echo "================================="


echo "Preparing a layer with production dependencies only"
yarn install --production --modules-folder nodejs/node_modules
yarn install --production --modules-folder nodejs/node16/node_modules
zip -q -r nodejs-layer.zip nodejs
rm -rf nodejs

# echo "Uploading lambda layer to AWS"
aws lambda publish-layer-version --layer-name "$layername" --compatible-runtimes "$runtime" --compatible-architectures "$arch" --zip-file "fileb://nodejs-layer.zip" > log/create-layer-output-$TIMESTAMP.json

echo "Completed. Cleaning up"
rm nodejs-layer.zip