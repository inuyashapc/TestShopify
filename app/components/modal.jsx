import { Form, FormLayout, Modal, TextField, Toast } from "@shopify/polaris";
import { useCallback, useState } from "react";

export default function ModalExample({ active, handleChange, id, fetcher }) {
  const [tag, setTag] = useState("");
  const [activeToast, setActiveToast] = useState(false);

  const handleSubmit = useCallback(async () => {
    const formData = new FormData();
    formData.append("id", id);
    formData.append("tag", tag);

    // await fetch(window.location.pathname, {
    //   method: "POST",
    //   body: formData,
    //   credentials: "same-origin",
    // });
    // fetcher.submit();

    fetcher.submit(
      { id: id, tag: tag },
      { method: "post", action: "/app/product" },
    );

    setTag("");
    handleChange();
    setActiveToast(true);
  }, [id, tag, handleChange, fetcher]);

  const handleTagChange = useCallback((value) => setTag(value), []);

  const toastMarkup = activeToast ? (
    <Toast
      content="Tag added successfully!"
      onDismiss={() => setActiveToast(false)}
    />
  ) : null;

  return (
    <>
      <Modal
        open={active}
        onClose={handleChange}
        title="Add tags to your products"
        primaryAction={{
          content: "Add Tag",
          onAction: handleSubmit,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: handleChange,
          },
        ]}
      >
        <Modal.Section>
          <Form onSubmit={handleSubmit}>
            <FormLayout>
              <TextField
                value={tag}
                onChange={handleTagChange}
                label="Tag"
                type="text"
                autoComplete="off"
                helpText="Add a new tag to this product"
              />
            </FormLayout>
          </Form>
        </Modal.Section>
      </Modal>

      {toastMarkup}
    </>
  );
}
