import { useCompoundForm, validator } from "formoid";
import { TextField, Button } from "~/common/components";
import { customValidator, pipe } from "~/common/utils";

type General = {
  name: string;
  lastName: string;
};

const initialValues: General = { name: "", lastName: "" };

type Experience = {
  company: string;
  position: string;
};

const emptyExperience: Experience = { company: "", position: "" };

type Technology = {
  name: string;
  years: string;
};

const emptyTechnology: Technology = { name: "", years: "" };

function isElementUnique<T>(array: Array<T>, element: T) {
  return array.indexOf(element) !== -1 && array.indexOf(element) === array.lastIndexOf(element);
}

function saveData<T>(data: T) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(console.log("Success", data)), 1000);
  });
}

function SectionHeader({ children }: { children: string }) {
  return (
    <span className="block w-full border-b border-b-black pb-1 text-center text-xl">
      {children}
    </span>
  );
}

export function JobApplication() {
  const { form, fieldArray, handleReset, handleSubmit, isSubmitting } = useCompoundForm({
    form: {
      initialValues,
      validationStrategy: "onBlur",
      validators: () => ({
        name: pipe(
          customValidator.nonBlankString(),
          validator.chain(validator.maxLength(32, "Name should be <= 32 chars long")),
        ),
        lastName: validator.sequence(
          customValidator.nonBlankString(),
          validator.maxLength(32, "Name should be <= 32 chars long"),
        ),
      }),
    },
    fieldArray: {
      initialValues: {
        experience: [emptyExperience],
        technologies: [emptyTechnology],
      },
      validationStrategy: "onBlur",
      validators: ({ fieldArray }) => ({
        experience: {
          company: customValidator.nonBlankString(),
          position: customValidator.nonBlankString(),
        },
        technologies: {
          name: pipe(
            customValidator.nonEmptyString(),
            validator.chain(
              validator.fromPredicate((value) => {
                return isElementUnique(
                  fieldArray.technologies.map(({ name }) => name),
                  value,
                );
              }, "Please remove duplicates"),
            ),
          ),
          years: customValidator.nonBlankString(),
        },
      }),
    },
  });

  const submit = () =>
    handleSubmit({
      onFailure: (errors) => {
        console.log("Failure", errors);
      },
      onSuccess: (values) => saveData(values),
    });

  return (
    <div className="mx-auto flex w-[600px] flex-col gap-4 py-4">
      <div className="flex w-full flex-col gap-4">
        <SectionHeader>General information</SectionHeader>
        <div className="flex gap-4">
          <TextField {...form.fieldProps("name")} placeholder="Name" />
          <TextField {...form.fieldProps("lastName")} placeholder="Last name" />
        </div>
      </div>
      <div className="flex w-full flex-col gap-4">
        <SectionHeader>Experience</SectionHeader>
        {fieldArray.experience.groups.map((group, index) => (
          <div className="flex gap-4" key={index}>
            <TextField {...group.company} placeholder="Company name" />
            <TextField {...group.position} placeholder="Position" />
            <Button
              color="danger"
              onClick={() => fieldArray.experience.remove(index)}
              type="button">
              Remove
            </Button>
          </div>
        ))}
        <Button onClick={() => fieldArray.experience.append(emptyExperience)} type="button">
          Add
        </Button>
      </div>
      <div className="flex w-full flex-col gap-4">
        <SectionHeader>Technologies</SectionHeader>
        {fieldArray.technologies.groups.map((group, index) => (
          <div className="flex gap-4" key={index}>
            <TextField {...group.name} placeholder="Name" />
            <TextField {...group.years} placeholder="Years of experience" />
            <Button
              color="danger"
              onClick={() => fieldArray.technologies.remove(index)}
              type="button">
              Remove
            </Button>
          </div>
        ))}
        <Button onClick={() => fieldArray.technologies.append(emptyTechnology)} type="button">
          Add
        </Button>
      </div>
      <div className="flex items-center justify-end gap-4">
        <Button color="danger" onClick={handleReset} type="reset">
          Reset
        </Button>
        <Button
          color="success"
          disabled={fieldArray.experience.groups.length === 0}
          loading={isSubmitting}
          onClick={submit}
          type="submit">
          Submit
        </Button>
      </div>
    </div>
  );
}
