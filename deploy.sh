FUNC_ARN=arn:aws:lambda:ap-southeast-1:917253244281:function:stripe-charge
ZIP_FILE=deploy.zip
TIMESTAMP=`date +"%Y%m%d-%H%M%S"`

zip -j -q $ZIP_FILE ./src/index.js
aws lambda update-function-code --function-name $FUNC_ARN --zip-file "fileb://$ZIP_FILE" > log/deploy-output.json
rm $ZIP_FILE