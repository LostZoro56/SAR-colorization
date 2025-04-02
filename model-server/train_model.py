import torch
import torch.nn as nn
from main import ColorizationNet

# Create model
model = ColorizationNet()

# Initialize weights with some random values
# This is just for testing - in a real scenario, you would train the model on SAR data
torch.nn.init.normal_(model.decoder[0].weight, mean=0.0, std=0.02)
torch.nn.init.normal_(model.decoder[2].weight, mean=0.0, std=0.02)
torch.nn.init.normal_(model.decoder[4].weight, mean=0.0, std=0.02)
torch.nn.init.normal_(model.decoder[6].weight, mean=0.0, std=0.02)
torch.nn.init.normal_(model.decoder[8].weight, mean=0.0, std=0.02)

# Save the model
torch.save(model.state_dict(), 'models/colorization_model.pth')
print("Model saved successfully!")
