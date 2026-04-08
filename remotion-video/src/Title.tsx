export const Title: React.FC<{
  titleText: string;
  titleColor: string;
}> = ({ titleText, titleColor }) => {
  return (
    <h1
      style={{
        fontFamily: "SF Pro Text, Helvetica, Arial, sans-serif",
        fontWeight: "bold",
        fontSize: 72,
        textAlign: "center",
        color: titleColor,
        marginTop: 20,
      }}
    >
      {titleText}
    </h1>
  );
};
