import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Checkbox, Label, Radio, Select, TextInput, Textarea } from "flowbite-react";

const generateTaskID = () => `TID-${Math.floor(10000 + Math.random() * 90000)}`;

const Component = () => {
  const navigate = useNavigate();
  const [taskID, setTaskID] = useState("");
  const [formData, setFormData] = useState({
    TaskID: "",
    Category: "",
    AssignDate: "",
    type: "",
    email: "",
    Name: "",
    Description: "",
    WorkGroupID: "",
    Location: "",
    DurationDays: "2",
  });

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen mt-20">
      <main>
        <h1 className="text-3xl text-center mt-6 font-extrabold underline text-blue-950 dark:text-slate-300">
          Components
        </h1>
      </main>
      <div className="flex p-3 w-[40%] mx-auto flex-col md:flex-row md:items-center gap-20 md:gap-20 mt-10">
        <form
          className="flex flex-col gap-4 w-full justify-center"
        >
          <div>
            <Label value="TaskID" />
            <TextInput
              type="text"
              name="TaskID"
              placeholder="TaskID"
              required
              value={formData.TaskID}
              readOnly
            />
          </div>
          <div>
            <Label value="Category" />
            <Select
              className=""
            >
              <option value="Select">Select a Category</option>
              <option value="Elavator">Elavator</option>
              <option value="Pest Control">Pest Control</option>
              <option value="Janitorial">Janitorial</option>
            </Select>
          </div>

          <div>
            <Label value="Date" />
            <TextInput
              type="date"
              id="AssignDate"
              min={new Date().toISOString().split("T")[0]}
              name="AssignDate"
              required
            />
          </div>

          <div>
            <Label value="type" />
            <Select
              className=""
            >
              <option value="Select">Select a Category</option>
              <option value="Pending">Pending</option>
              <option value="Inprogress">Inprogress</option>
              <option value="Completed">Completed</option>
            </Select>
          </div>

          <div>
            <Label value="Email Address" />
            <TextInput
              type="text"
              name="email"
              placeholder="email"
              required
              value={formData.email}
            />
          </div>

          <div>
            <Label value="Name" />
            <TextInput
              type="text"
              name="Name"
              placeholder="Name"
              required
              value={formData.Name}
            />
          </div>
          <div>
            <Label value="Description" />
            <Textarea
              type="textarea"
              name="Description"
              placeholder="Add a Description..."
              rows="3"
              maxLength="200"
              value={formData.Description}
            />
          </div>
          <div>
            <div>
              <Label value="WorkGroupID" />
              <TextInput
                type="text"
                name="WorkGroupID"
                placeholder="WorkGroupID"
                required
                value={formData.WorkGroupID}
              />
            </div>
            <div>
              <div>
                <Label value="Location" />
                <TextInput
                  type="text"
                  name="Location"
                  placeholder="Location"
                  value={formData.Location}
                  required
                />
              </div>
              <div>
                <Label value="Duration" />
                <TextInput
                  type="number"
                  name="DurationDays"
                  placeholder="Duration"
                  required
                  value={formData.DurationDays}
                />
              </div>
            </div>
          </div>
          <div>
            <Checkbox /> checkbox
            <Radio /> radio
          </div>
          <Button
            type="submit"
            gradientDuoTone="purpleToBlue"
            className="uppercase"
          >
            Assign task
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Component;