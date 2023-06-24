import { useCompoundForm } from "formoid";
import { useEffect } from "react";
import { TextField, Button } from "~/common/components";
import { customValidator } from "~/common/utils";

type General = {
  name: string;
  lastName: string;
};

type Experience = {
  company: string;
  position: string;
};

type Technologies = {
  name: string;
  years: string;
};

export function JobApplication() {
  const { form, fieldArray, handleSubmit, isSubmitting } = useCompoundForm({
    form: {
      initialValues: {
        name: "",
        lastName: "",
      } satisfies General,
      validationStrategy: "onBlur",
      validators: () => ({
        name: null,
        lastName: null,
      }),
    },
    fieldArray: {
      initialValues: {
        experience: [{ company: "", position: "" }] as Array<Experience>,
        technologies: [{ name: "", years: "" }] as Array<Technologies>,
      },
      validationStrategy: "onBlur",
      validators: () => ({
        experience: {
          company: null,
          position: customValidator.nonBlankString(),
        },
        technologies: {
          name: null,
          years: null,
        },
      }),
    },
  });

  useEffect(() => console.log(fieldArray.technologies.errors), [fieldArray.technologies.errors]);

  const reset = () => {
    form.handleReset();
    fieldArray.experience.handleReset();
    fieldArray.technologies.handleReset();
  };

  const submit = () =>
    handleSubmit({
      onFailure: () => {
        console.log({
          general: form.errors,
          experience: fieldArray.experience.errors,
          technologies: fieldArray.technologies.errors,
        });
      },
      onSuccess: (values) => Promise.resolve(console.log(values)),
    });

  return (
    <div className="mx-auto flex w-[600px] flex-col gap-4 py-4">
      <div className="flex w-full flex-col gap-4">
        <span className="mx-auto text-xl">General information</span>

        <div className="flex gap-4">
          <TextField {...form.fieldProps("name")} placeholder="Name" />
          <TextField {...form.fieldProps("lastName")} placeholder="Last name" />
        </div>
      </div>

      <hr className="border-t-black" />

      <div className="flex w-full flex-col gap-4">
        <span className="mx-auto text-xl">Experience</span>

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
        <Button
          onClick={() => fieldArray.experience.append({ company: "", position: "" })}
          type="button">
          Add
        </Button>
      </div>

      <hr className="border-t-black" />

      <div className="flex w-full flex-col gap-4">
        <span className="mx-auto text-xl">Technologies</span>

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
        <Button
          onClick={() => fieldArray.technologies.append({ name: "", years: "" })}
          type="button">
          Add
        </Button>
      </div>

      <div className="flex items-center justify-end gap-4">
        <Button color="danger" onClick={reset} type="reset">
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
